import type { Express } from "express";
import { workspaceStorage } from "./storage";
import { registerWorkspaceRoutes } from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("workspace");

export class WorkspaceModule {
    static initialize(app: Express) {
        registerWorkspaceRoutes(app);
        log.info("Workspace service initialized");
    }

    static storage = workspaceStorage;
}

export * from "./storage";
export * from "./routes";
