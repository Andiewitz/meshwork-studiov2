/**
 * Auth module database access.
 * Uses the shared server-wide pool from server/lib/db.
 * The auth module supports an optional AUTH_DATABASE_URL env var for cases
 * where auth data is on a separate Postgres instance (e.g., a dedicated auth
 * database). If AUTH_DATABASE_URL is not set, it falls back to the shared pool.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { db as sharedDb, pool as sharedPool } from "../../lib/db";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("auth-db");

const { Pool } = pg;

// Only create a separate pool if AUTH_DATABASE_URL explicitly points
// to a different database. Otherwise reuse the shared pool.
const authConnectionString = process.env.AUTH_DATABASE_URL;

export const pool = authConnectionString
  ? new Pool({ connectionString: authConnectionString })
  : sharedPool;

export const db = authConnectionString ? drizzle(pool, { schema }) : sharedDb;

// Create tables if they don't exist
async function createTables() {
  if (!authConnectionString && !process.env.DATABASE_URL) return;

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

    // Create login_attempts table for account lockout protection
    // eslint-disable-next-line no-secrets/no-secrets
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
  if (!authConnectionString && !process.env.DATABASE_URL) return;

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
