import type { Express } from "express";
import aiRoutes from "./routes";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("ai");

/**
 * AI Module - BYOK (Bring Your Own Key) AI Service
 *
 * This module provides:
 * - Secure encrypted storage of user API keys
 * - Server-side proxy to AI providers (OpenAI, Anthropic, etc.)
 * - Key management endpoints
 */

import type { AppContext } from "../../lib/registry";

export class AIModule {
  static initialize(app: Express, context: AppContext) {
    // Mount AI routes under /api/v1/ai
    app.use("/api/v1/ai", aiRoutes(context));

    log.info("AI service initialized at /api/v1/ai");
  }
}

export * from "./encryption";
export * from "./db";
export * from "./resolver";
