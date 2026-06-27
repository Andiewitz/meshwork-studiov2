import "dotenv/config";
import { logger, createChildLogger } from "./lib/logger";
const log = createChildLogger("server");
log.info("Starting initialization phase 0...");
import express, { type Request, Response, NextFunction } from "express";
import { db } from "./modules/workspace/db";
import { sql } from "drizzle-orm";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { csrfProtection, generateCsrfToken, validateCsrfToken } from "./middleware/csrf";
import { apiLimiter } from "./middleware/rateLimit";
import { isRedisAvailable } from "./lib/redis";
import { metricsMiddleware } from "./middleware/metricsMiddleware";
import { metricsRegistry } from "./lib/metrics";

let isAppReady = false;

const app = express();
const httpServer = createServer(app);

// SECURITY: Trust the NGINX reverse proxy so rate limiting works per user IP, not proxy IP
app.set("trust proxy", 1);

// SECURITY: Apply global rate limiting to all API routes
app.use("/api/", apiLimiter);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS / CSP need frontendUrl — declare it first
const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");

// SECURITY: Add security headers with CSP for external resources
const cspConfig = {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "script-src": ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
    "frame-src": ["'self'", "https://www.google.com", "https://recaptcha.google.com"],
    "connect-src": ["'self'", frontendUrl, "https://www.google.com", "https://www.gstatic.com"],
    "img-src": ["'self'", "data:", "https://www.gstatic.com", "https://*.googleusercontent.com", "https://lh3.googleusercontent.com", "https://lh4.googleusercontent.com", "https://lh5.googleusercontent.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  },
};

if (process.env.NODE_ENV === "production") {
  app.use(helmet({
    contentSecurityPolicy: cspConfig,
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...cspConfig.directives,
        "script-src": ["'self'", "'unsafe-inline'", "localhost", "https://www.google.com", "https://www.gstatic.com"],
        "connect-src": ["'self'", "localhost:*", "ws://localhost:*", "https://www.google.com", "https://www.gstatic.com"],
      },
    },
  }));
}

// CORS configuration (for all environments)
if (frontendUrl) {
  app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }));
} else if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
}

// API Versioning Compatibility Layer
app.use((req, res, next) => {
  if (req.url.startsWith("/api/") && !req.url.startsWith("/api/v1/")) {
    req.url = req.url.replace("/api/", "/api/v1/");
  }
  next();
});

// SECURITY: Add request size limits to prevent DoS
app.use(
  express.json({
    limit: "5mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "5mb" }));

// Prometheus metrics middleware
app.use(metricsMiddleware);

// SECURITY: CSRF Protection - Setup cookie parser before CSRF middleware
app.use(cookieParser());

// Note: CSRF protection is applied per-route in auth routes,
// not globally, because it needs session middleware to be initialized first.
// Session middleware is initialized by setupAuth() in registerRoutes()

// Real Health Check endpoint
app.get("/health", async (_req, res) => {
  try {
    const checks = {
      postgres: false,
      redis: false,
    };

    // Check Postgres
    try {
      await db.execute(sql`SELECT 1`);
      checks.postgres = true;
    } catch (err) {
      log.error({ err }, "Postgres health check failed");
    }

    // Check Redis
    checks.redis = await isRedisAvailable();

    const isHealthy = checks.postgres && checks.redis;
    const status = isHealthy ? "healthy" : "degraded";
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks,
    });
  } catch (err) {
    log.error({ err }, "Health check endpoint error");
    res.status(500).json({ status: "error", message: "Internal health check error" });
  }
});

// Readiness Probe
app.get("/ready", (_req, res) => {
  if (isAppReady) {
    res.status(200).json({ status: "ready" });
  } else {
    res.status(503).json({ status: "not_ready" });
  }
});

// Prometheus Metrics Endpoint
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", metricsRegistry.contentType);
    const metrics = await metricsRegistry.metrics();
    res.send(metrics);
  } catch (err) {
    log.error({ err }, "Metrics endpoint error");
    res.status(500).send("Error generating metrics");
  }
});


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData: Record<string, any> = {
        method: req.method,
        path,
        status: res.statusCode,
        duration,
      };

      // SECURITY: Sanitize logs to prevent leaking sensitive data (PII, tokens, etc.)
      if (capturedJsonResponse && process.env.NODE_ENV === "production") {
        const sanitized = { ...capturedJsonResponse };
        const sensitiveKeys = ["email", "password", "token", "passwordHash", "apiKey", "secret"];
        
        const redact = (obj: any) => {
          for (const key in obj) {
            if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
              obj[key] = "[REDACTED]";
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
              redact(obj[key]);
            }
          }
        };
        redact(sanitized);
        logData.response = sanitized;
      } else if (capturedJsonResponse) {
        logData.response = capturedJsonResponse;
      }

      log.info(logData, `${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Start listening BEFORE expensive initialization to pass healthchecks early.
  // Port 0.0.0.0 is required for Railway/Docker.
  httpServer.listen(port, "0.0.0.0", () => {
    log.info(`Server started listening on port ${port} (initializing modules...)`);
  });

  try {
    log.info("Starting database migrations...");
    try {
      await db.execute(sql`ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT CURRENT_TIMESTAMP`);
      // Targeted hotfix: revert `updated_at` for legacy workspaces corrupted by the above DEFAULT CURRENT_TIMESTAMP
      await db.execute(sql`UPDATE workspaces SET updated_at = created_at WHERE updated_at > '2026-04-19 07:00:00' AND updated_at < '2026-04-19 08:30:00' AND created_at < '2026-04-19 07:00:00'`);
      log.info("Database migrations applied successfully");
    } catch (dbErr) {
      log.warn({ err: dbErr }, "Failed to apply DB migrations, might already exist or DB is unavailable");
    }
    
    log.info("Starting module initialization...");
    await registerRoutes(httpServer, app);
    log.info("All modules initialized successfully");

    // Initialize WebSocket presence server for real-time cursors
    const { initializeWebSocket } = await import("./modules/team/websocket");
    initializeWebSocket(httpServer);
    log.info("WebSocket presence server initialized");

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log.error({ err }, "Internal Server Error");

      if (res.headersSent) {
        return next(err);
      }

      // Handle Postgres database constraint errors
      if (err.code === '23505') {
        return res.status(400).json({ message: "A record with this value already exists. Please use a unique value." });
      }
      if (err.code === '23503') {
        return res.status(400).json({ message: "Referenced record does not exist or cannot be deleted." });
      }
      if (err.code === '22P02') {
        return res.status(400).json({ message: "Invalid data format provided." });
      }

      return res.status(status).json({ message });
    });

    // Importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      log.info("Serving static frontend files from /public");
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
    
    isAppReady = true;
    log.info(`Server fully ready and serving on port ${port}`);
  } catch (error) {
    log.fatal({ err: error }, "CRITICAL FAILURE DURING SERVER INITIALIZATION");
    log.error("The server is still listening on /health but other routes may be broken.");
    // We do NOT exit to allow healthcheck to pass and logs to stay accessible.
  }
})();
