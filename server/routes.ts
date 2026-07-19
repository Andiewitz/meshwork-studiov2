import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { AuthModule } from "./modules/auth";
import { WorkspaceModule } from "./modules/workspace";
import { CanvasModule } from "./modules/canvas";
import { AIModule } from "./modules/ai";
import { TeamModule } from "./modules/team";
import { MetricsModule } from "./modules/metrics";
import { createChildLogger } from "./lib/logger";
import { generateCsrfToken, csrfProtection } from "./middleware/csrf";
import { AppRegistry } from "./lib/registry";
import { eventBus } from "./lib/events";

// Storages for registration
import { authStorage } from "./modules/auth/storage";
import { workspaceStorage } from "./modules/workspace/storage";
import { teamStorage } from "./modules/team/storage";
import { canvasStorage } from "./modules/canvas/storage";

const log = createChildLogger("server");

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // CSRF token endpoint — must be available before auth middleware
  app.get(
    "/api/v1/csrf-token",
    csrfProtection,
    generateCsrfToken,
    (req: Request, res: Response) => {
      try {
        const token =
          typeof req.csrfToken === "function"
            ? req.csrfToken()
            : "mock-csrf-token";
        res.json({ csrfToken: token, message: "CSRF token generated" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to generate CSRF token",
          error:
            process.env.NODE_ENV === "production" ? undefined : String(error),
        });
      }
    },
  );

  // Setup Service Registry and Event Bus
  const registry = new AppRegistry();
  registry.register("authStorage", authStorage);
  registry.register("workspaceStorage", workspaceStorage);
  registry.register("teamStorage", teamStorage);
  registry.register("canvasStorage", canvasStorage);

  const context = { registry, eventBus };

  // Initialize Auth Module first (as other modules might depend on its middleware)
  await AuthModule.initialize(app, context);
  registry.register("isAuthenticated", AuthModule.middleware.isAuthenticated);

  // Initialize Canvas Module (handles nodes and edges) - must listen before WorkspaceModule for user.deleted
  CanvasModule.initialize(app, context);

  // Initialize Workspace Module (handles collections and workspaces)
  WorkspaceModule.initialize(app, context);

  // Initialize AI Module (handles BYOK AI service)
  AIModule.initialize(app, context);

  // Initialize Team Module (handles teams, members, and shared workspaces)
  TeamModule.initialize(app, context);

  // Initialize Metrics Module (background collector + history API)
  await MetricsModule.initialize(app, context);

  log.info("All modules initialized");

  return httpServer;
}
