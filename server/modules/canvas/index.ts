import type { Express } from "express";
import { canvasStorage } from "./storage";
import { registerCanvasRoutes } from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("canvas");

export class CanvasModule {
    static initialize(app: Express) {
        registerCanvasRoutes(app);
        log.info("Canvas service initialized");
    }

    static storage = canvasStorage;
}

export * from "./storage";
export * from "./routes";

