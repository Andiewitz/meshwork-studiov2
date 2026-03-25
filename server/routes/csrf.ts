import type { Express, Request, Response } from "express";
import { generateCsrfToken } from "../middleware/csrf";

/**
 * Register CSRF token routes
 * This allows the client to fetch a CSRF token for API requests
 */
export function registerCsrfRoutes(app: Express) {
  // GET endpoint to fetch CSRF token
  // This should be called on page load or session start
  app.get("/api/csrf-token", generateCsrfToken, (req: Request, res: Response) => {
    // Token is already added to response headers by generateCsrfToken middleware
    // Also return it in body for convenience
    res.json({
      csrfToken: (req as any).csrfToken(),
      message: "CSRF token generated",
    });
  });
}
