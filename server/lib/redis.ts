import Redis from "ioredis";
import type { Redis as RedisType } from "ioredis";

// ─── Singleton Redis Client ─────────────────────────────────────────
// Used for sessions, caching, and general key-value operations.
// For pub/sub, use createRedisClient() to get a dedicated connection.

let redis: RedisType | null = null;
let redisAvailable = false;

function getRedisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379";
}

/**
 * Get the singleton Redis client.
 * Lazily connects on first call. Returns null if Redis is not configured
 * or unavailable (allows graceful degradation in development).
 */
export function getRedis(): RedisType | null {
  if (redis) return redis;

  try {
    redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          console.warn("[Redis] Max reconnection attempts reached, giving up");
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000); // Exponential backoff, max 2s
      },
      lazyConnect: true,
    });

    redis.on("connect", () => {
      redisAvailable = true;
      console.log("[Redis] Connected successfully");
    });

    redis.on("error", (err) => {
      redisAvailable = false;
      // Only warn once, don't spam logs
      if (redis?.status === "connecting") {
        console.warn("[Redis] Connection failed:", err.message);
      }
    });

    redis.on("close", () => {
      redisAvailable = false;
    });

    // Attempt connection (non-blocking)
    redis.connect().catch((err) => {
      console.warn("[Redis] Initial connection failed (degrading gracefully):", err.message);
      redisAvailable = false;
    });

    return redis;
  } catch (err: any) {
    console.warn("[Redis] Failed to create client:", err.message);
    return null;
  }
}

/**
 * Create a new, independent Redis connection.
 * Required for pub/sub (ioredis enters subscriber mode on the connection,
 * blocking it from other commands).
 */
export function createRedisClient(): RedisType | null {
  try {
    const client = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });
    return client;
  } catch (err: any) {
    console.warn("[Redis] Failed to create client:", err.message);
    return null;
  }
}

/**
 * Check if Redis is currently connected and responsive.
 * Used by the health check endpoint.
 */
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis || !redisAvailable) return false;
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

/**
 * Gracefully disconnect the singleton Redis client.
 * Call during server shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    redisAvailable = false;
  }
}
