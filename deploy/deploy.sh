#!/bin/bash
# deploy.sh — run on EC2 after git pull
# Usage: ./deploy.sh

set -e

APP_DIR="/home/ec2-user/app"
REPO_DIR="$APP_DIR/meshwork-studio"

echo "=== Deploy started at $(date) ==="

# Pull latest code
cd "$REPO_DIR"
git pull origin main

# Install deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build
echo "Building..."
npm run build

# Run migrations
echo "Running migrations..."
npx drizzle-kit migrate

# Restart app
echo "Restarting app..."
pm2 restart meshwork || pm2 start dist/index.cjs --name meshwork

# Save PM2 config
pm2 save

echo "=== Deploy complete at $(date) ==="