import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { AuthModule } from "./modules/auth";
import { WorkspaceModule } from "./modules/workspace";
import { CanvasModule } from "./modules/canvas";
import { AIModule } from "./modules/ai";
import { TeamModule } from "./modules/team";
import { generateCsrfToken, csrfProtection } from "./middleware/csrf";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // CSRF token endpoint — must be available before auth middleware
  app.get("/api/csrf-token", csrfProtection, generateCsrfToken, (req: Request, res: Response) => {
    try {
      const token = (req as any).csrfToken();
      res.json({ csrfToken: token, message: "CSRF token generated" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to generate CSRF token",
        error: process.env.NODE_ENV === "production" ? undefined : String(error),
      });
    }
  });

  // Initialize Auth Module first (as other modules might depend on its middleware)
  await AuthModule.initialize(app);

  // Initialize Workspace Module (handles collections and workspaces)
  WorkspaceModule.initialize(app);

  // Initialize Canvas Module (handles nodes and edges)
  CanvasModule.initialize(app);

  // Initialize AI Module (handles BYOK AI service)
  AIModule.initialize(app);

  // Initialize Team Module (handles teams, members, and shared workspaces)
  TeamModule.initialize(app);

  console.log("[Monolith] All modules initialized");

  return httpServer;
}
