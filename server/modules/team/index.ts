import type { Express } from "express";
import { teamStorage } from "./storage";
import { registerTeamRoutes } from "./routes";

export class TeamModule {
    static initialize(app: Express) {
        registerTeamRoutes(app);
        console.log("[TeamModule] Team service initialized");
    }

    static storage = teamStorage;
}

export * from "./storage";
export * from "./routes";
