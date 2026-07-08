import type { Express } from "express";
import { teamStorage } from "./storage";
import { registerTeamRoutes } from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("team");

import type { AppContext } from "../../lib/registry";

export class TeamModule {
  static initialize(app: Express, context: AppContext) {
    registerTeamRoutes(app, context);

    context.eventBus.on("user.deleted", async ({ id, tx }) => {
      try {
        await teamStorage.deleteAllUserData(id, tx);
        log.info({ userId: id }, "User team data deleted via event");
      } catch (err) {
        log.error({ err, userId: id }, "Failed to delete user team data");
      }
    });

    log.info("Team service initialized");
  }

  static storage = teamStorage;
}

export * from "./storage";
export * from "./routes";
