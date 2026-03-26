import type { Express, Request, Response } from "express";
import { generateCsrfToken, csrfProtection } from "../middleware/csrf";

/**
 * Register CSRF token routes
 * This allows the client to fetch a CSRF token for API requests
 */
export function registerCsrfRoutes(app: Express) {
  // GET endpoint to fetch CSRF token
  // Apply CSRF protection to generate the token
  // In development, still allow token generation but skip validation on protected routes
  app.get("/api/csrf-token", csrfProtection, generateCsrfToken, (req: Request, res: Response) => {
    try {
      const token = (req as any).csrfToken();
      console.log("[CSRF] Token generated:", token ? "✓" : "✗");
      
      res.json({
        csrfToken: token,
        message: "CSRF token generated",
      });
    } catch (error) {
      console.error("[CSRF] Error generating token:", error);
      res.status(500).json({
        message: "Failed to generate CSRF token",
        error: process.env.NODE_ENV === "production" ? undefined : String(error),
      });
    }
  });
}
