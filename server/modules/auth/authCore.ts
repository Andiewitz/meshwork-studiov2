import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";
import { createGoogleStrategy } from "./strategies/google";
import { createLocalStrategy } from "./strategies/local";

const getSession = () => {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const connectionString = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
  
  // SECURITY: Require SESSION_SECRET in production - fallback to temporary secret if missing to avoid healthcheck crash
  if (!process.env.SESSION_SECRET) {
    console.error("[AuthCore] CRITICAL: SESSION_SECRET environment variable is missing!");
    if (process.env.NODE_ENV === "production") {
      console.error("[AuthCore] Using emergency fallback secret. SESSIONS WILL NOT BE SECURE UNTIL FIXED.");
    }
  }

  if (!connectionString) {
    const MemoryStore = memorystore(session);
    return session({
      secret: process.env.SESSION_SECRET || "dev_only_insecure_dev_key_12345",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000
      }),
      cookie: { secure: false }
    });
  }

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: connectionString,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "emergency_fallback_secret_not_real_production_key_12345",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Session expired or not logged in" });
};
