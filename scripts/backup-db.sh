#!/bin/bash

# Ensure backups directory exists
mkdir -p ./backups
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "Starting Postgres Database Backup: $TIMESTAMP"

# 1. Backup Workspace Database
echo "Backing up Workspace DB..."
docker exec emnesh-postgres-workspace pg_dump -U user -d emnesh_workspace -F c -f /tmp/workspace_$TIMESTAMP.dump
docker cp emnesh-postgres-workspace:/tmp/workspace_$TIMESTAMP.dump ./backups/workspace_$TIMESTAMP.dump
docker exec emnesh-postgres-workspace rm /tmp/workspace_$TIMESTAMP.dump

# 2. Backup Auth Database
echo "Backing up Auth DB..."
docker exec emnesh-postgres-auth pg_dump -U user -d emnesh_auth -F c -f /tmp/auth_$TIMESTAMP.dump
docker cp emnesh-postgres-auth:/tmp/auth_$TIMESTAMP.dump ./backups/auth_$TIMESTAMP.dump
docker exec emnesh-postgres-auth rm /tmp/auth_$TIMESTAMP.dump

echo "✅ Backup complete! Files saved in ./backups directory."
