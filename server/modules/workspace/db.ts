import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("workspace-db");

const { Pool } = pg;

const connectionString = process.env.WORKSPACE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    log.warn("WORKSPACE_DATABASE_URL not set, falling back to in-memory mode if configured");
}

export const pool = new Pool({ connectionString: connectionString || "postgres://" });
export const db = drizzle(pool, { schema });

// Create tables if they don't exist
async function createTables() {
    if (!connectionString) return;

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

        // Create teams table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teams (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(64) NOT NULL,
                invite_code VARCHAR(8) UNIQUE NOT NULL,
                owner_id VARCHAR NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        log.info("Teams table created/verified");

        // Create team_members table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS team_members (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
                user_id VARCHAR NOT NULL,
                role VARCHAR(16) NOT NULL DEFAULT 'member',
                color VARCHAR(7) NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        log.info("Team Members table created/verified");

        // Create team_workspaces table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS team_workspaces (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
                workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        log.info("Team Workspaces table created/verified");

    } catch (err) {
        log.error({ err }, "Failed to create tables");
    }
}

// Safe column migrations — ADD COLUMN IF NOT EXISTS is idempotent, never drops data
async function runMigrations() {
    if (!connectionString) return;

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
