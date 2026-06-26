import type { Express } from "express";
import { teamStorage } from "./storage";
import { registerTeamRoutes } from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("team");

export class TeamModule {
    static initialize(app: Express) {
        registerTeamRoutes(app);
        log.info("Team service initialized");
    }

    static storage = teamStorage;
}

export * from "./storage";
export * from "./routes";
