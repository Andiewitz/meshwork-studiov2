/**
 * Workspace module database access.
 * Uses the shared server-wide pool from server/lib/db.
 */
import { db, pool } from "../../lib/db";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("workspace-db");

export { db, pool };

// Create workspace-domain tables if they don't exist.
// NOTE: Teams/team_members DDL has been removed — those tables are the
// responsibility of the team module.
async function createTables() {
  if (!process.env.DATABASE_URL) return;

  try {
    // Enable pgcrypto for gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Create collections table for workspace organization
    await pool.query(`
            CREATE TABLE IF NOT EXISTS collections (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                user_id TEXT,
                parent_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    log.info("Collections table created/verified");

    // Create workspaces table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS workspaces (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'system',
                icon TEXT DEFAULT 'box',
                is_favorite BOOLEAN DEFAULT false,
                user_id TEXT,
                collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                author TEXT,
                ai_context TEXT,
                groups JSONB DEFAULT '[]'::jsonb,
                tags JSONB DEFAULT '[]'::jsonb
            );
        `);
    log.info("Workspaces table created/verified");
  } catch (err) {
    log.error({ err }, "Failed to create tables");
  }
}

// Safe column migrations — ADD COLUMN IF NOT EXISTS is idempotent, never drops data
async function runMigrations() {
  if (!process.env.DATABASE_URL) return;

  try {
    // v1.1: Add is_favorite to workspaces
    await pool.query(`
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
        `);
    // v1.2: Add updated_at to workspaces
    await pool.query(`
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
    // v1.3: Add description, author, ai_context, groups, and tags to workspaces
    await pool.query(`
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS author TEXT;
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS ai_context TEXT;
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS groups JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
        `);
    log.info("Migrations verified (is_favorite, updated_at, metadata)");
  } catch (err) {
    log.error({ err }, "Migration failed");
  }
}

createTables().then(() => runMigrations());
