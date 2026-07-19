/**
 * Canvas module database access.
 * Uses the shared server-wide pool from server/lib/db.
 */
import { db, pool } from "../../lib/db";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("canvas-db");

export { db, pool };

// Create canvas-domain tables if they don't exist.
async function createTables() {
  if (!process.env.DATABASE_URL) return;

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
    log.info("Nodes table created/verified");

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
    log.info("Edges table created/verified");

    // Safe column migrations - ADD COLUMN IF NOT EXISTS is idempotent
    await pool.query(`
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS style JSONB;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS width INTEGER;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS height INTEGER;
            ALTER TABLE nodes ADD COLUMN IF NOT EXISTS measured JSONB;
            
            ALTER TABLE edges ADD COLUMN IF NOT EXISTS style JSONB;
            ALTER TABLE edges ADD COLUMN IF NOT EXISTS marker_end JSONB;
        `);
    log.info("Canvas table columns migrated (style, dimensions)");
  } catch (err) {
    log.error({ err }, "Failed to create tables");
  }
}

createTables();
