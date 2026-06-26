import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("auth-db");

const { Pool } = pg;

const connectionString = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    log.warn("AUTH_DATABASE_URL not set, falling back to in-memory mode if configured");
}

export const pool = new Pool({ connectionString: connectionString || "postgres://" });
export const db = drizzle(pool, { schema });

// Create tables if they don't exist
async function createTables() {
    if (!connectionString) return;

    try {
        // Enable pgcrypto for gen_random_uuid()
        await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

        // Create users table with new auth fields
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR UNIQUE NOT NULL,
                first_name VARCHAR,
                last_name VARCHAR,
                profile_image_url VARCHAR,
                password_hash VARCHAR,
                auth_provider VARCHAR NOT NULL DEFAULT 'email',
                has_notified_team BOOLEAN DEFAULT false,
                read_notification_ids JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        log.info("Users table created/verified");

        // Create sessions table for connect-pg-simple
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                sid VARCHAR PRIMARY KEY,
                sess JSONB NOT NULL,
                expire TIMESTAMP NOT NULL
            );
        `);
        log.info("Sessions table created/verified");

        // Create login_attempts table for account lockout protection
        await pool.query(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR NOT NULL,
                failed INTEGER NOT NULL DEFAULT 0,
                last_attempt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                locked_until TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS IDX_login_attempts_email ON login_attempts(email);
            CREATE INDEX IF NOT EXISTS IDX_login_attempts_locked_until ON login_attempts(locked_until);
        `);
        log.info("Login attempts table created/verified");

    } catch (err) {
        log.error({ err }, "Failed to create tables");
    }
}

// Safe column migrations — ADD COLUMN IF NOT EXISTS is idempotent, never drops data
async function runMigrations() {
    if (!connectionString) return;

    try {
        // v1.1: Add notification preference columns to users
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS has_notified_team BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS read_notification_ids JSONB DEFAULT '[]'::jsonb;
        `);
        log.info("Migrations verified (notification preferences)");
    } catch (err) {
        log.error({ err }, "Migration failed");
    }
}

createTables().then(() => runMigrations());
