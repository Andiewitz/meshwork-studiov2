import type { Express } from "express";
import { workspaceStorage } from "./storage";
import { registerWorkspaceRoutes } from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("workspace");

import type { AppContext } from "../../lib/registry";

export class WorkspaceModule {
    static initialize(app: Express, context: AppContext) {
        registerWorkspaceRoutes(app, context);

        context.eventBus.on('user.deleted', async ({ id, tx }) => {
            try {
                await workspaceStorage.deleteAllUserData(id, tx);
                log.info({ userId: id }, "User workspaces and collections deleted via event");
            } catch (err) {
                log.error({ err, userId: id }, "Failed to delete user workspaces");
            }
        });

        log.info("Workspace service initialized");
    }

    static storage = workspaceStorage;
}

export * from "./storage";
export * from "./routes";
