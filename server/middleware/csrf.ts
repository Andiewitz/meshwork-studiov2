import type { Request, Response, NextFunction } from "express";
import csrf from "csurf";

declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

/**
 * CSRF Protection Middleware
 * 
 * Uses double-submit cookie pattern for CSRF protection.
 * The token should be:
 * 1. Generated for each session
 * 2. Sent to client in response header
 * 3. Sent back by client in request header or body for state-changing operations
 */

// Initialize CSRF protection with cookie-based storage
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

/**
 * Middleware to generate CSRF token
 * This should be called on the initial page load or login
 */
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Generate token and attach to response header
  const token = req.csrfToken();
  res.set("X-CSRF-Token", token);
  next();
};

/**
 * Middleware to validate CSRF token on state-changing operations
 * Checks for token in:
 * 1. X-CSRF-Token header (preferred for APIs)
 * 2. _csrf body field (for form submissions)
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET/HEAD/OPTIONS (idempotent methods)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for public auth endpoints (handled specially)
  if (req.path === "/api/auth/register" || req.path === "/api/auth/login") {
    return next();
  }

  csrfProtection(req, res, (err: any) => {
    if (err) {
      // CSRF token validation failed
      console.warn("[CSRF] Token validation failed for:", req.method, req.path);
      return res.status(403).json({
        message: "CSRF validation failed",
        error: process.env.NODE_ENV === "production" ? undefined : err.message,
      });
    }
    next();
  });
};

/**
 * Helper to get CSRF token from request
 * Used internally to verify token presence
 */
export const getCsrfToken = (req: Request): string | null => {
  return (
    req.get("X-CSRF-Token") ||
    (req.body && req.body._csrf) ||
    null
  );
};
