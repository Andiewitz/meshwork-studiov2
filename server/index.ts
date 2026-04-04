console.log("[Monolith] Starting initialization phase 0...");
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { csrfProtection, generateCsrfToken, validateCsrfToken } from "./middleware/csrf";
import { apiLimiter } from "./middleware/rateLimit";

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

// SECURITY: Add security headers with CSP for external resources
const cspConfig = {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "script-src": ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
    "frame-src": ["'self'", "https://www.google.com", "https://recaptcha.google.com"],
    "connect-src": ["'self'", frontendUrl, "https://www.google.com", "https://www.gstatic.com"],
    "img-src": ["'self'", "data:", "https://www.gstatic.com"],
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
        scriptSrc: ["'self'", "'unsafe-inline'", "localhost", "https://www.google.com", "https://www.gstatic.com"],
        connectSrc: ["'self'", "localhost:*", "ws://localhost:*", "https://www.google.com", "https://www.gstatic.com"],
      },
    },
  }));
}

// CORS configuration (for all environments)
const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");
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

// SECURITY: CSRF Protection - Setup cookie parser before CSRF middleware
app.use(cookieParser());

// Note: CSRF protection is applied per-route in auth routes,
// not globally, because it needs session middleware to be initialized first.
// Session middleware is initialized by setupAuth() in registerRoutes()

// Health check for Railway
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
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
        logLine += ` :: ${JSON.stringify(sanitized)}`;
      } else if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Start listening BEFORE expensive initialization to pass healthchecks early.
  // Port 0.0.0.0 is required for Railway/Docker.
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`server started listening on port ${port} (initializing modules...)`);
    },
  );

  try {
    log("starting module initialization...");
    await registerRoutes(httpServer, app);
    log("all modules initialized successfully");

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    // Importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      log("serving static frontend files from /public");
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
    
    log(`server fully ready and serving on port ${port}`);
  } catch (error) {
    console.error("CRITICAL FAILURE DURING SERVER INITIALIZATION:", error);
    console.error("The server is still listening on /health but other routes may be broken.");
    // We do NOT exit to allow healthcheck to pass and logs to stay accessible.
  }
})();
