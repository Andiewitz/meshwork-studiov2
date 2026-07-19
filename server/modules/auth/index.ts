import type { Express } from "express";
import { setupAuth, isAuthenticated } from "./authCore";
import { registerAuthRoutes } from "./routes";
import { authStorage } from "./storage";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("auth");

import type { AppContext } from "../../lib/registry";

export class AuthModule {
  static async initialize(app: Express, context: AppContext) {
    await setupAuth(app);
    registerAuthRoutes(app, context);
    log.info("Authentication service initialized");
  }

  static storage = authStorage;
  static middleware = { isAuthenticated };
}

// Only export the public API surface — do NOT barrel-export internal modules
// (routes, storage internals) to keep the auth boundary clean.
export type { AppContext };
export { isAuthenticated };
