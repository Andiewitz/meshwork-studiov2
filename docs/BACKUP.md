# Database Backup, Restore & Migrations

> [!IMPORTANT]
> This project implements two layers of data safety: **Application-Level Backups** (JSON dumps) and **Safe In-Place Migrations** (idempotent schema updates).

---

## 1. Fast Application-Level Backup (JSON)

This is the recommended way to quickly back up table data before running a deployment or a manual schema change. It works in all environments (Docker, Cloud, or Local).

### Usage

```bash
# Set your DATABASE_URL and run the backup
DATABASE_URL=postgres://... npm run db:backup
```

### What it does:
1. Creates a timestamped folder in `./backups/`
2. Iterates through critical tables (`users`, `workspaces`, `collections`, `nodes`, `edges`)
3. Dumps each table as a readable, pretty-printed `.json` file.
4. Redacts sensitive credentials in the metadata file (`_meta.json`).

**Output Structure:**
```text
./backups/2026-04-17T14-00-00-000Z/
├── users.json
├── workspaces.json
├── collections.json
├── nodes.json
├── edges.json
└── _meta.json
```

---

## 2. Infrastructure Backup (PostgreSQL Binary)

If you are running the stack via **Docker Compose**, you can use the container-level shell scripts to create full binary `.dump` files.

### Windows (PowerShell)
```powershell
.\scripts\backup-db.ps1
```

### Mac / Linux (Bash)
```bash
chmod +x ./scripts/backup-db.sh
./scripts/backup-db.sh
```

These scripts perform a raw `pg_dump` inside the containers, which is better for full system restores and handles large datasets more efficiently than JSON dumps.

---

## 3. Safe Schema Migrations

The application uses an **idempotent migration strategy** to ensure production data is never lost during schema updates (like adding new columns).

### The "Deletion" Scare Pattern
When adding a new column (e.g., `is_favorite`), the server-side code might error with `column "is_favorite" does not exist`. This **does not mean data was deleted** — it just means the app is trying to read/write a column that hasn't been physically added to the database yet.

### Our Solution
We use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` inside the database initialization logic (`server/modules/*/db.ts`).

1. **Table Creation**: `CREATE TABLE IF NOT EXISTS` ensures tables are there for fresh installs.
2. **Column Migration**: `runMigrations()` is called after table verification to safely add any new columns to existing production data without dropping the table.

```typescript
// Example migration pattern
async function runMigrations() {
    await pool.query(`
        ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
    `);
}
```

---

## 4. Restoring Data

### From JSON (Manual)
JSON backups are intended for verification and manual point-restoration. To restore a workspace:
1. Identify the deleted workspace in your `backups/<timestamp>/workspaces.json`.
2. Re-insert it via the database CLI or a script.

### From Binary `.dump`
See the full restore instructions in [PERSISTENCE.md](./PERSISTENCE.md) or follow the `pg_restore` standard:

```bash
docker exec emnesh-postgres-workspace pg_restore -U user -d emnesh_workspace --clean /tmp/restore.dump
```

---

## .gitignore
The `./backups/` directory is automatically excluded from version control to prevent sensitive data from being pushed to GitHub. Always store your backups in a secure, secondary location (like S3 or a local encrypted drive).
