import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../password";

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
        // SECURITY: Minimal logging - never log email or auth attempts
        
        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user) {
          // SECURITY: Generic error message to prevent email enumeration
          return done(null, false, { message: "Invalid email or password" });
        }

        // Check if user has a password (email auth)
        if (!user.passwordHash) {
          // SECURITY: Generic error message
          return done(null, false, { message: "Invalid email or password" });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        
        if (!isValid) {
          // SECURITY: Generic error message to prevent brute force detection
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          authProvider: user.authProvider,
        });
      } catch (err) {
        console.error("[LocalAuth] Authentication error - check logs for details");
        return done(err);
      }
    }
  );
}
