import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.WORKSPACE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("[CanvasDB] WORKSPACE_DATABASE_URL not set, falling back to in-memory mode if configured");
}

export const pool = new Pool({ connectionString: connectionString || "postgres://" });
export const db = drizzle(pool, { schema });

// Create tables if they don't exist
async function createTables() {
    if (!connectionString) return;

    try {
        // Create nodes table for canvas elements
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT NOT NULL,
                workspace_id INTEGER NOT NULL,
                type TEXT,
                position JSONB NOT NULL,
                data JSONB NOT NULL,
                parent_id TEXT,
                extent TEXT,
                PRIMARY KEY (id, workspace_id)
            );
        `);
        // Migration: Ensure the composite unique constraint exists if the table was created with only 'id' as PK
        await pool.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'nodes_pkey' AND table_name = 'nodes'
                ) THEN
                    -- Check if it's just 'id'
                    IF (SELECT count(*) FROM information_schema.key_column_usage WHERE constraint_name = 'nodes_pkey' AND table_name = 'nodes') = 1 THEN
                        ALTER TABLE nodes DROP CONSTRAINT nodes_pkey;
                        ALTER TABLE nodes ADD PRIMARY KEY (id, workspace_id);
                    END IF;
                END IF;
            END $$;
        `);
        console.log("[CanvasDB] Nodes table created/verified");

        // Create edges table for connections
        await pool.query(`
            CREATE TABLE IF NOT EXISTS edges (
                id TEXT NOT NULL,
                workspace_id INTEGER NOT NULL,
                source TEXT NOT NULL,
                target TEXT NOT NULL,
                source_handle TEXT,
                target_handle TEXT,
                type TEXT,
                data JSONB,
                animated INTEGER DEFAULT 0,
                PRIMARY KEY (id, workspace_id)
            );
        `);
        // Migration: Ensure the composite unique constraint exists if the table was created with only 'id' as PK
        await pool.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'edges_pkey' AND table_name = 'edges'
                ) THEN
                    -- Check if it's just 'id'
                    IF (SELECT count(*) FROM information_schema.key_column_usage WHERE constraint_name = 'edges_pkey' AND table_name = 'edges') = 1 THEN
                        ALTER TABLE edges DROP CONSTRAINT edges_pkey;
                        ALTER TABLE edges ADD PRIMARY KEY (id, workspace_id);
                    END IF;
                END IF;
            END $$;
        `);
        console.log("[CanvasDB] Edges table created/verified");

        // Safe column migrations - ADD COLUMN IF NOT EXISTS is idempotent
        await pool.query(`
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS style JSONB;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS width INTEGER;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS height INTEGER;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS measured JSONB;
            
            ALTER TABLE edges ADD COLUMN IF NOT EXISTS style JSONB;
            ALTER TABLE edges ADD COLUMN IF NOT EXISTS marker_end JSONB;
        `);
        console.log("[CanvasDB] Canvas table columns migrated (style, dimensions)");

    } catch (err) {
        console.error("[CanvasDB] Failed to create tables:", err);
    }
}

createTables();
