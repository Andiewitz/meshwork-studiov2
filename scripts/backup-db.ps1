$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = ".\backups"

# Ensure backups directory exists
if (!(Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Starting Postgres Database Backup: $timestamp"

# 1. Backup Workspace Database
Write-Host "Backing up Workspace DB..."
docker exec emnesh-postgres-workspace pg_dump -U user -d emnesh_workspace -F c -f "/tmp/workspace_$timestamp.dump"
docker cp "emnesh-postgres-workspace:/tmp/workspace_$timestamp.dump" "$backupDir\workspace_$timestamp.dump"
docker exec emnesh-postgres-workspace rm "/tmp/workspace_$timestamp.dump"

# 2. Backup Auth Database
Write-Host "Backing up Auth DB..."
docker exec emnesh-postgres-auth pg_dump -U user -d emnesh_auth -F c -f "/tmp/auth_$timestamp.dump"
docker cp "emnesh-postgres-auth:/tmp/auth_$timestamp.dump" "$backupDir\auth_$timestamp.dump"
docker exec emnesh-postgres-auth rm "/tmp/auth_$timestamp.dump"

Write-Host "✅ Backup complete! Files saved in $backupDir directory." -ForegroundColor Green
