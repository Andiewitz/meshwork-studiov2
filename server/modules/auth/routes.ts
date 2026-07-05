import type { Express, Request, Response } from "express";
import { createChildLogger } from "../../lib/logger";
import passport from "passport";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./password";
import {
  generateTokens,
  verifyToken,
  revokeRefreshToken,
  isRefreshTokenRevoked,
} from "./jwt";
import { isAuthenticated } from "./authCore";
import { optionalCaptchaMiddleware } from "./captcha";
import { authLimiter, refreshLimiter } from "../../middleware/rateLimit";
import { csrfProtection } from "../../middleware/csrf";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema, changePasswordSchema } from "./schemas";
import type { AppContext } from "../../lib/registry";

const log = createChildLogger("auth");

// Register auth-specific routes
export function registerAuthRoutes(app: Express, context: AppContext): void {
  // Google OAuth routes
  app.get(
    "/api/v1/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  app.get(
    "/api/v1/auth/google/callback",
    (req: Request, res: Response, next) => {
      passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) {
          log.warn({ err }, "Google OAuth callback error");
          return res.redirect("/?auth=login&error=google");
        }
        if (!user) {
          log.warn({ info }, "Google OAuth rejected — no user returned");
          return res.redirect("/?auth=login&error=google");
        }

        req.login(user, (err) => {
          if (err) {
            log.error(
              { err, userId: user.id },
              "Google OAuth session login failed",
            );
            return res.redirect("/?auth=login&error=google");
          }

          const { accessToken, refreshToken } = generateTokens(user);

          const isProd = process.env.NODE_ENV === "production";
          res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          return res.redirect("/");
        });
      })(req, res, next);
    },
  );

  // Register with email/password (with CAPTCHA and CSRF protection)
  // CSRF is active in production by default; set ENABLE_CSRF=true in .env to test locally
  const csrfEnabled =
    process.env.ENABLE_CSRF === "true" || process.env.NODE_ENV === "production";
  const conditionalCsrf = csrfEnabled
    ? csrfProtection
    : (_req: any, _res: any, next: any) => next();

  app.post(
    "/api/v1/auth/register",
    authLimiter,
    conditionalCsrf,
    optionalCaptchaMiddleware,
    validate({ body: registerSchema }),
    async (req: Request, res: Response) => {
      if (!csrfEnabled) {
        log.debug(
          "CSRF disabled for register (set ENABLE_CSRF=true to enable)",
        );
      }
      log.info({ email: req.body?.email }, "Register attempt received");
      try {
        const { email, password, firstName, lastName } = req.body;

        // SECURITY: Validate password strength
        const validation = validatePasswordStrength(password);
        if (!validation.valid) {
          return res.status(400).json({
            message: "Password does not meet security requirements",
            errors: validation.errors,
          });
        }

        // Check if user already exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (existingUser) {
          // SECURITY: Generic message prevents email enumeration
          return res
            .status(409)
            .json({ message: "Registration could not be completed" });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            authProvider: "email",
          })
          .returning();

        // Log the new user in immediately (same as login route)
        req.login(newUser, (err) => {
          if (err) {
            log.error(
              { err, userId: newUser.id, email },
              "Register: req.login (session serialization) failed",
            );
            // Account was created successfully even if auto-login fails — fall back to old behavior
            return res.status(201).json({
              message: "Registration successful",
              userId: newUser.id,
            });
          }

          try {
            const { accessToken, refreshToken } = generateTokens(newUser);
            const isProd = process.env.NODE_ENV === "production";

            res.cookie("access_token", accessToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie("refresh_token", refreshToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            log.info(
              { userId: newUser.id, email },
              "Register: tokens set, response sent",
            );
            // Return user object like login does (for client query cache)
            return res.status(201).json({ user: newUser });
          } catch (tokenErr: any) {
            log.error(
              { err: tokenErr, userId: newUser.id, email },
              "Register: token generation or cookie setup failed",
            );
            // Fall back to old behavior
            return res.status(201).json({
              message: "Registration successful",
              userId: newUser.id,
            });
          }
        });
      } catch (err: any) {
        log.error({ err, email: req.body?.email }, "Registration error");
        res
          .status(500)
          .json({ message: "Registration failed due to a server error" });
      }
    },
  );

  // Login with email/password (NO CAPTCHA for returning users, with CSRF protection)
  // Uses the same csrfEnabled flag as register (ENABLE_CSRF=true or production)

  app.post(
    "/api/v1/auth/login",
    authLimiter,
    conditionalCsrf,
    validate({ body: loginSchema }),
    (req: Request, res: Response, next) => {
      if (!csrfEnabled) {
        log.debug("CSRF disabled for login (set ENABLE_CSRF=true to enable)");
      }
      const { email } = req.body || {};
      log.info({ email }, "Login attempt received");

      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          log.error(
            { err, email },
            "Login: passport authenticate callback error",
          );
          return next(err);
        }
        if (!user) {
          log.warn(
            {
              email,
              infoMessage: info?.message,
              lockedUntil: info?.lockedUntil,
            },
            "Login: authentication rejected by strategy",
          );
          const response: any = {
            message:
              info?.message ||
              "Authentication failed - please check your credentials",
          };
          // Include lockout information if account is locked
          if (info?.lockedUntil) {
            response.locked_until = info.lockedUntil;
          }
          return res.status(401).json(response);
        }

        log.info(
          { userId: user.id, email },
          "Login: strategy accepted, calling req.login",
        );

        req.login(user, (err) => {
          if (err) {
            log.error(
              { err, userId: user.id, email },
              "Login: req.login (session serialization) failed",
            );
            return next(err);
          }

          log.info(
            { userId: user.id, email },
            "Login: req.login successful, generating tokens",
          );

          try {
            const { accessToken, refreshToken } = generateTokens(user);

            const isProd = process.env.NODE_ENV === "production";
            res.cookie("access_token", accessToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie("refresh_token", refreshToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            log.info(
              { userId: user.id, email },
              "Login: tokens set, response sent",
            );
            return res.json({ user });
          } catch (tokenErr: any) {
            log.error(
              { err: tokenErr, userId: user.id, email },
              "Login: token generation or cookie setup failed",
            );
            return next(tokenErr);
          }
        });
      })(req, res, next);
    },
  );

  // Refresh Token endpoint
  app.post(
    "/api/v1/auth/refresh",
    refreshLimiter,
    async (req: Request, res: Response) => {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const payload = verifyToken(refreshToken, "refresh");
      if (!payload) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      // SECURITY: Check if token has been revoked in Redis
      if (payload.jti) {
        const isRevoked = await isRefreshTokenRevoked(payload.jti);
        if (isRevoked) {
          log.warn(
            { userId: payload.userId, jti: payload.jti },
            "Attempt to use revoked refresh token",
          );
          res.clearCookie("access_token");
          res.clearCookie("refresh_token");
          return res.status(401).json({ message: "Token has been revoked" });
        }
      }

      // SECURITY: Verify the user still exists and is not deleted before minting new tokens
      try {
        const [existingUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, payload.userId));

        if (!existingUser) {
          log.warn(
            { userId: payload.userId },
            "Refresh attempt for non-existent user",
          );
          res.clearCookie("access_token");
          res.clearCookie("refresh_token");
          return res.status(401).json({ message: "User no longer exists" });
        }
      } catch (dbError) {
        log.error(
          { err: dbError, userId: payload.userId },
          "Database error during refresh user check",
        );
        return res
          .status(503)
          .json({ message: "Service temporarily unavailable" });
      }

      // Generate new access token
      const { accessToken } = generateTokens({ id: payload.userId });

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.json({ message: "Token refreshed successfully" });
    },
  );

  // Logout
  app.post("/api/v1/auth/logout", async (req: Request, res: Response) => {
    // Revoke the current refresh token if it exists
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const payload = verifyToken(refreshToken, "refresh");
      if (payload?.jti) {
        await revokeRefreshToken(payload.jti);
      }
    }

    // Clear JWT cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    req.logout((err) => {
      if (err) {
        log.error({ err, userId: (req as any).user?.id }, "Logout error");
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current authenticated user
  app.get(
    "/api/v1/auth/me",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;

        // E2E bypass — return the mock user directly, skip DB
        if (process.env.E2E_BYPASS_AUTH === "true") {
          return res.json(req.user);
        }

        // Try to fetch from database first
        let user;
        try {
          const [dbUser] = await db
            .select({
              id: users.id,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImageUrl: users.profileImageUrl,
              authProvider: users.authProvider,
              hasNotifiedTeam: users.hasNotifiedTeam,
              readNotificationIds: users.readNotificationIds,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId));
          user = dbUser;
        } catch (dbError) {
          log.error(
            { err: dbError, userId },
            "Database error fetching user in /auth/me",
          );

          if (process.env.NODE_ENV === "production") {
            return res
              .status(503)
              .json({ message: "Service temporarily unavailable" });
          }

          // Fallback to in-memory user from Passport session (development only)
          log.warn(
            { userId },
            "Using session fallback for /auth/me (development mode)",
          );
          user = {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            profileImageUrl: req.user.profileImageUrl,
            authProvider: req.user.authProvider,
            hasNotifiedTeam: req.user.hasNotifiedTeam || false,
            readNotificationIds: req.user.readNotificationIds || [],
            createdAt: req.user.createdAt || new Date(),
          };
        }

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
      } catch (error) {
        log.error({ err: error, userId: req.user?.id }, "Error fetching user");
        res
          .status(500)
          .json({ message: "Failed to fetch user profile - please try again" });
      }
    },
  );

  // Update user preferences (notifications, team notified, etc)
  app.patch(
    "/api/v1/user/preferences",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;
        const { hasNotifiedTeam, readNotificationIds } = req.body;

        const updateData: any = {};
        if (typeof hasNotifiedTeam === "boolean")
          updateData.hasNotifiedTeam = hasNotifiedTeam;
        if (Array.isArray(readNotificationIds))
          updateData.readNotificationIds = readNotificationIds;

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ message: "No preferences to update" });
        }

        const [updatedUser] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            hasNotifiedTeam: users.hasNotifiedTeam,
            readNotificationIds: users.readNotificationIds,
          });

        res.json(updatedUser);
      } catch (error) {
        log.error(
          { err: error, userId: req.user?.id },
          "Error updating preferences",
        );
        res.status(500).json({ message: "Failed to update preferences" });
      }
    },
  );

  // Update user profile
  app.patch(
    "/api/v1/user/profile",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;
        const { firstName, lastName } = req.body;

        const [updatedUser] = await db
          .update(users)
          .set({
            firstName: firstName || null,
            lastName: lastName || null,
          })
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            authProvider: users.authProvider,
            createdAt: users.createdAt,
          });

        res.json(updatedUser);
      } catch (error) {
        log.error(
          { err: error, userId: req.user?.id },
          "Error updating profile",
        );
        res.status(500).json({ message: "Failed to update profile" });
      }
    },
  );

  // Change password
  app.post(
    "/api/v1/user/change-password",
    csrfProtection,
    isAuthenticated,
    validate({ body: changePasswordSchema }),
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // SECURITY: Validate new password strength
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
          return res.status(400).json({
            message: "New password does not meet security requirements",
            errors: validation.errors,
          });
        }

        // Get user with password hash
        const [user] = await db
          .select({ passwordHash: users.passwordHash })
          .from(users)
          .where(eq(users.id, userId));

        if (!user?.passwordHash) {
          return res
            .status(400)
            .json({ message: "Cannot change password for OAuth accounts" });
        }

        // Verify current password
        const isValid = await verifyPassword(
          currentPassword,
          user.passwordHash,
        );
        if (!isValid) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await db
          .update(users)
          .set({ passwordHash: newPasswordHash })
          .where(eq(users.id, userId));

        res.json({ message: "Password changed successfully" });
      } catch (error) {
        log.error(
          { err: error, userId: req.user?.id },
          "Error changing password",
        );
        res.status(500).json({ message: "Failed to change password" });
      }
    },
  );

  // Delete all user data (workspaces, nodes, edges, collections)
  app.delete(
    "/api/v1/user/data",
    csrfProtection,
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;

        await db.transaction(async (tx) => {
          // Emit event for other modules to clean up user data
          await context.eventBus.emitAsync("user.deleted", { id: userId, tx });
        });

        res.json({ message: "All data deleted successfully" });
      } catch (error) {
        log.error(
          { err: error, userId: req.user?.id },
          "Error deleting user data",
        );
        res.status(500).json({ message: "Failed to delete user data" });
      }
    },
  );

  // Delete account and all data
  app.delete(
    "/api/v1/user/account",
    csrfProtection,
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.id;

        await db.transaction(async (tx) => {
          // Emit event for other modules to clean up user data
          await context.eventBus.emitAsync("user.deleted", { id: userId, tx });

          // Delete user
          await tx.delete(users).where(eq(users.id, userId));
        });

        // Logout user
        req.logout(() => {
          res.json({ message: "Account deleted successfully" });
        });
      } catch (error) {
        log.error(
          { err: error, userId: req.user?.id },
          "Error deleting account",
        );
        res.status(500).json({ message: "Failed to delete account" });
      }
    },
  );
}
