# Database Backup & Restore

> How to back up and restore both Meshwork Studio databases when running with Docker Compose.

## Overview

The app uses two separate PostgreSQL databases:

| Database | Container | Purpose |
|----------|-----------|---------|
| `emnesh_workspace` | `emnesh-postgres-workspace` | Workspaces, nodes, edges, collections |
| `emnesh_auth` | `emnesh-postgres-auth` | Users, sessions, login attempts, API keys |

Backup scripts dump both databases in **Postgres custom format** (`.dump` files), which are compressed and restore-ready.

---

## Running a Backup

### Windows (PowerShell)

```powershell
.\scripts\backup-db.ps1
```

### Mac / Linux (Bash)

```bash
chmod +x ./scripts/backup-db.sh
./scripts/backup-db.sh
```

Both scripts do the same thing:
1. Create a `./backups/` directory if it doesn't exist
2. Run `pg_dump` inside each container
3. Copy the dump file out to `./backups/` on your host machine
4. Clean up the temp file inside the container

### Output

Backup files are timestamped and saved to `./backups/`:

```
./backups/
├── workspace_2026-04-05_14-30-00.dump
└── auth_2026-04-05_14-30-00.dump
```

---

## Restoring from a Backup

### Full Restore

```bash
# 1. Stop the app (optional but recommended)
docker-compose stop emnesh-backend

# 2. Copy dump files into the containers
docker cp ./backups/workspace_2026-04-05_14-30-00.dump emnesh-postgres-workspace:/tmp/restore.dump
docker cp ./backups/auth_2026-04-05_14-30-00.dump emnesh-postgres-auth:/tmp/restore.dump

# 3. Restore the workspace database
docker exec emnesh-postgres-workspace pg_restore \
  -U user \
  -d emnesh_workspace \
  --clean \
  --if-exists \
  /tmp/restore.dump

# 4. Restore the auth database
docker exec emnesh-postgres-auth pg_restore \
  -U user \
  -d emnesh_auth \
  --clean \
  --if-exists \
  /tmp/restore.dump

# 5. Restart the app
docker-compose start emnesh-backend
```

> [!WARNING]
> `--clean --if-exists` drops all existing tables before restoring. This is a **destructive** operation. Only run this when you intentionally want to replace all data.

### Restore a Single Table (Advanced)

If you only need to restore specific data without nuking everything:

```bash
# Extract just the nodes table from a dump
pg_restore -t nodes ./backups/workspace_2026-04-05_14-30-00.dump | \
  docker exec -i emnesh-postgres-workspace psql -U user -d emnesh_workspace
```

---

## Scheduling Automated Backups

### Windows — Task Scheduler

1. Open **Task Scheduler** → Create Basic Task
2. Set trigger: Daily at a time of your choice
3. Set action: Start a Program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\project\scripts\backup-db.ps1"`
   - Start in: `C:\path\to\project`

### Mac / Linux — cron

```bash
# Edit crontab
crontab -e

# Add a daily backup at 2am
0 2 * * * cd /path/to/project && ./scripts/backup-db.sh >> /var/log/meshwork-backup.log 2>&1
```

---

## What's Inside a `.dump` File

The dumps use Postgres **custom format** (`-F c`). This format:
- Is compressed (smaller than plain SQL)
- Supports selective restoration (by table, by object)
- Is not human-readable (use `pg_restore --list` to inspect)

```bash
# List contents of a dump
docker exec emnesh-postgres-workspace pg_restore --list /tmp/workspace.dump
```

---

## `.gitignore` Note

The `./backups/` directory is in `.gitignore`. Dump files are **never committed to git** — they may contain sensitive user data.

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/backup-db.ps1` | Windows PowerShell backup script |
| `scripts/backup-db.sh` | Mac/Linux bash backup script |
| `docker-compose.yml` | Defines container names used in scripts |
| `.gitignore` | Excludes `backups/` from version control |
