import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.WORKSPACE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("[WorkspaceDB] WORKSPACE_DATABASE_URL not set, falling back to in-memory mode if configured");
}

export const pool = new Pool({ connectionString: connectionString || "postgres://" });
export const db = drizzle(pool, { schema });

// Create tables if they don't exist
async function createTables() {
    if (!connectionString) return;

    try {
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
        console.log("[WorkspaceDB] Collections table created/verified");

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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("[WorkspaceDB] Workspaces table created/verified");

    } catch (err) {
        console.error("[WorkspaceDB] Failed to create tables:", err);
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
        console.log("[WorkspaceDB] Migrations verified (is_favorite, updated_at)");
    } catch (err) {
        console.error("[WorkspaceDB] Migration failed:", err);
    }
}

createTables().then(() => runMigrations());
