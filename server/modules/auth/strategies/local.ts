import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createChildLogger } from "../../../lib/logger";
import { verifyPassword } from "../password";
import {
  isAccountLocked,
  recordFailedAttempt,
  resetFailedAttempts,
} from "../lockout";

const log = createChildLogger("auth-local");

// In-memory user store for development mode (no database)
interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  authProvider: string;
}

const inMemoryUsers = new Map<string, InMemoryUser>();

// For development, create a test user
// Password: Test123!@#

const TEST_USER_PASSWORD_HASH =
  "$2b$12$v6EvD7w1EWp73YDjRxZIE.ujiDaph6AfLjFCuNEAfSA7VSBLRee9O"; // bcrypt hash of "Test123!@#" with salt rounds 12
inMemoryUsers.set("test@example.com", {
  id: "test-user-1",
  email: "test@example.com",
  passwordHash: TEST_USER_PASSWORD_HASH,
  firstName: "Test",
  lastName: "User",
  authProvider: "email",
});

/**
 * Create and configure Local (email/password) strategy
 */
export function createLocalStrategy() {
  return new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        // SECURITY: Check if account is locked due to failed attempts
        const lockoutStatus = await isAccountLocked(email);
        if (lockoutStatus.locked) {
          const lockedUntilTime =
            lockoutStatus.lockedUntil?.toLocaleString() || "unknown";
          log.warn(
            { email, lockedUntil: lockedUntilTime },
            "Login blocked: account locked",
          );
          return done(null, false, {
            message:
              "Account temporarily locked due to too many failed login attempts. Please try again later.",
            lockedUntil: lockoutStatus.lockedUntil,
          } as any);
        }

        // SECURITY: Minimal logging - never log email or auth attempts

        // Find user by email (with database fallback)
        let user: any = null;
        try {
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
          user = dbUser;
        } catch (error: any) {
          log.error(
            { err: error?.message, email },
            "Local strategy: DB query failed, falling back to in-memory",
          );
          // Fallback to in-memory users
          user = inMemoryUsers.get(email);
        }

        if (!user) {
          // SECURITY: Record failed attempt and prevent email enumeration
          await recordFailedAttempt(email);
          log.info({ email }, "Local strategy: no user found");
          return done(null, false, {
            message: "No account found with this email",
          });
        }

        // Check if user has a password (email auth)
        if (!user.passwordHash) {
          // SECURITY: Record failed attempt
          await recordFailedAttempt(email);
          log.info(
            { email },
            "Local strategy: user has no password (OAuth-only account)",
          );
          return done(null, false, {
            message:
              "This account uses Google Login. Please sign in with Google.",
          });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          // SECURITY: Record failed attempt
          const failureInfo = await recordFailedAttempt(email);

          // Inform user if they're about to be locked
          const message = failureInfo.locked
            ? `Incorrect password. Account locked due to too many failed attempts.`
            : `Incorrect password. Please try again.`;

          log.info(
            {
              email,
              attemptsRemaining: failureInfo.attemptsRemaining,
              locked: failureInfo.locked,
            },
            "Local strategy: incorrect password",
          );
          return done(null, false, {
            message,
            lockedUntil: failureInfo.lockedUntil,
          } as any);
        }

        // Successful login - reset failed attempts
        await resetFailedAttempts(email);

        log.info(
          { email, userId: user.id },
          "Local strategy: authentication successful",
        );
        return done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          authProvider: user.authProvider,
        } as Express.User);
      } catch (err: any) {
        log.error(
          { err: err?.message, stack: err?.stack, email },
          "Local strategy: unhandled exception",
        );
        return done(err);
      }
    },
  );
}
