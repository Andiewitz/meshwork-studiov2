import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { createChildLogger } from "./logger";

const log = createChildLogger("db");

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  log.error(
    "DATABASE_URL is not set. All database operations will fail at runtime.",
  );
}

/**
 * Shared connection pool for the entire server process.
 * All modules import from here — do NOT create additional pools.
 *
 * Pool sizing: max=20 is appropriate for a monolith on a single Postgres
 * instance. When individual modules are extracted to microservices, each
 * service will own its own pool with a smaller max (e.g., 5–10).
 */
export const pool = new Pool({
  connectionString: connectionString || "postgres://",
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  log.error({ err }, "Unexpected error on idle database client");
});

export const db = drizzle(pool, { schema });

export { schema };
