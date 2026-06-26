import type { Express } from "express";
import { setupAuth, isAuthenticated } from "./authCore";
import { registerAuthRoutes } from "./routes";
import { authStorage } from "./storage";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("auth");

export class AuthModule {
    static async initialize(app: Express) {
        await setupAuth(app);
        registerAuthRoutes(app);
        log.info("Authentication service initialized");
    }

    static storage = authStorage;
    static middleware = { isAuthenticated };
}

export * from "./authCore";
export * from "./routes";
export * from "./storage";
