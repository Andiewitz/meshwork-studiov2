import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("metrics-db");
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ connectionString: connectionString || "postgres://" });
export const db = drizzle(pool, { schema });

export async function createMetricsTable() {
  if (!connectionString) {
    log.warn("DATABASE_URL not set, metrics snapshots disabled");
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS metrics_snapshots (
        id SERIAL PRIMARY KEY,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        total_requests REAL NOT NULL DEFAULT 0,
        request_rate REAL NOT NULL DEFAULT 0,
        avg_duration_ms REAL NOT NULL DEFAULT 0,
        memory_mb REAL NOT NULL DEFAULT 0,
        cpu_seconds REAL NOT NULL DEFAULT 0,
        event_loop_lag_ms REAL NOT NULL DEFAULT 0,
        ws_connections INTEGER NOT NULL DEFAULT 0,
        ws_rooms INTEGER NOT NULL DEFAULT 0,
        ai_requests REAL NOT NULL DEFAULT 0
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_metrics_snapshots_captured_at
      ON metrics_snapshots (captured_at DESC);
    `);
    log.info("Metrics snapshots table created/verified");
  } catch (err) {
    log.error({ err }, "Failed to create metrics_snapshots table");
  }
}
