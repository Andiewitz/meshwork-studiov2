import passport from "passport";
import { createChildLogger } from "../../lib/logger";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import RedisStore from "connect-redis";
import memorystore from "memorystore";
import { getRedis } from "../../lib/redis";
import { createGoogleStrategy } from "./strategies/google";
import { createLocalStrategy } from "./strategies/local";
import { verifyToken } from "./jwt";

const log = createChildLogger("auth");

const getSession = () => {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const connectionString =
    process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;

  // SECURITY: Require SESSION_SECRET in production - fallback to temporary secret if missing to avoid healthcheck crash
  if (!process.env.SESSION_SECRET) {
    log.error("CRITICAL: SESSION_SECRET environment variable is missing!");
    if (process.env.NODE_ENV === "production") {
      log.error(
        "Using emergency fallback secret. SESSIONS WILL NOT BE SECURE UNTIL FIXED.",
      );
    }
  }

  const redisClient = getRedis();

  if (!redisClient) {
    log.warn(
      "Redis client not available, falling back to in-memory session store (development only)",
    );
    const MemoryStore = memorystore(session);
    return session({
      secret: process.env.SESSION_SECRET || "dev_only_insecure_dev_key_12345",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      cookie: { secure: false },
    });
  }

  const sessionStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
    ttl: sessionTtl / 1000, // connect-redis uses seconds for ttl, not ms
  });

  return session({
    secret:
      process.env.SESSION_SECRET ||
      "emergency_fallback_secret_not_real_production_key_12345",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // 'lax' is required for OAuth — 'strict' blocks the session cookie on
      // the redirect back from Google, so Passport can never log the user in
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
};

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Register Google strategy if configured
  const googleStrategy = createGoogleStrategy();
  if (googleStrategy) {
    passport.use("google", googleStrategy);
  }

  // Register Local strategy
  passport.use("local", createLocalStrategy());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // E2E Test Auth Bypass — allow mock dashboard/canvas testing without active session cookie
  if (process.env.E2E_BYPASS_AUTH === "true") {
    req.user = {
      id: "mock-id-1",
      email: "architect@meshwork.dev",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: null,
      authProvider: "local",
      hasNotifiedTeam: false,
      readNotificationIds: [],
      createdAt: new Date(),
    } as any;
    return next();
  }

  // First check if the user is authenticated via Passport session (useful during transition/OAuth)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Then check for JWT access token in cookies
  const accessToken = req.cookies?.access_token;
  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  const payload = verifyToken(accessToken, "access");
  if (!payload) {
    return res.status(401).json({ message: "Access token expired or invalid" });
  }

  // Map the JWT payload to req.user so downstream handlers work seamlessly
  req.user = { id: payload.userId } as any;
  next();
};
