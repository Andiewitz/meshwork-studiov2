import jwt from "jsonwebtoken";
import type { User } from "@shared/schema";
import { createChildLogger } from "../../lib/logger";
import { getRedis } from "../../lib/redis";

const log = createChildLogger("auth-jwt");

// Access token TTL: 15 minutes
export const ACCESS_TOKEN_EXPIRATION = "15m";
// Refresh token TTL: 7 days
export const REFRESH_TOKEN_EXPIRATION = "7d";

// Ensure we have a secret in production

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_insecure_jwt_secret_1234567890";

if (!process.env.JWT_SECRET) {
  log.warn(
    "JWT_SECRET environment variable is missing! Using insecure default for development.",
  );
  if (process.env.NODE_ENV === "production") {
    log.error(
      "CRITICAL: JWT_SECRET MUST be set in production to secure tokens!",
    );
  }
}

export interface JwtPayload {
  userId: string;
  type: "access" | "refresh";
  // Used for revocation via Redis — every token now has one
  jti: string;
}

export function generateTokens(user: Pick<User, "id">) {
  const accessJti = crypto.randomUUID();
  const accessToken = jwt.sign(
    { userId: user.id, type: "access", jti: accessJti },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION },
  );

  const refreshJti = crypto.randomUUID();
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh", jti: refreshJti },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION },
  );

  return { accessToken, refreshToken, accessJti, refreshJti };
}

export function verifyToken(
  token: string,
  expectedType: "access" | "refresh",
): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.type !== expectedType) {
      log.warn(
        { expectedType, actualType: decoded.type },
        "Token type mismatch",
      );
      return null;
    }
    return decoded;
  } catch (err: unknown) {
    const jwtErr = err as { name?: string; message?: string };
    if (jwtErr.name !== "TokenExpiredError") {
      log.warn({ err: jwtErr.message }, "Token verification failed");
    }
    return null;
  }
}

/**
 * Revokes a specific refresh token by its JTI (JWT ID).
 * The revocation is stored in Redis for 7 days (the max lifetime of a refresh token).
 */
export async function revokeRefreshToken(jti: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    log.warn(
      "Redis is not available, token revocation will not be persisted across restarts",
    );
    // Fallback? We don't have a reliable in-memory fallback here for cluster mode,
    // but in dev it's fine. For production, Redis is required.
    return;
  }

  // 7 days in seconds
  const TTL_SECONDS = 7 * 24 * 60 * 60;
  try {
    await redis.setex(`revoked_jti:${jti}`, TTL_SECONDS, "1");
    log.debug({ jti }, "Refresh token revoked successfully");
  } catch (err) {
    log.error({ err, jti }, "Failed to revoke refresh token in Redis");
  }
}

/**
 * Revokes a specific access token by its JTI (JWT ID).
 * The revocation is stored in Redis for 15 minutes (the max lifetime of an access token).
 */
export async function revokeAccessToken(jti: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    log.warn("Redis is not available, access token revocation not persisted");
    return;
  }
  // 15 minutes in seconds — matches ACCESS_TOKEN_EXPIRATION
  const TTL_SECONDS = 15 * 60;
  try {
    await redis.setex(`revoked_jti:${jti}`, TTL_SECONDS, "1");
    log.debug({ jti }, "Access token revoked");
  } catch (err) {
    log.error({ err, jti }, "Failed to revoke access token in Redis");
  }
}

/**
 * Checks if a specific token (by its JTI) has been revoked.
 */
export async function isRefreshTokenRevoked(jti: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    // If Redis is down, we fail open (allow the token) to prevent complete outage,
    // or fail closed depending on security posture. Let's fail open but log a warning.
    log.warn("Redis is not available, cannot verify token revocation status");
    return false;
  }

  try {
    const isRevoked = await redis.exists(`revoked_jti:${jti}`);
    return isRevoked === 1;
  } catch (err) {
    log.error({ err, jti }, "Failed to check token revocation status in Redis");
    return false;
  }
}
