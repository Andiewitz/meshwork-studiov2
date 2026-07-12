#!/bin/bash
# deploy.sh — run on EC2 after git pull
# Usage: cd /home/ec2-user/app/meshwork-studio && ./deploy/deploy.sh

set -euo pipefail

APP_DIR="/home/ec2-user/app"
REPO_DIR="$APP_DIR/meshwork-studio"
ENV_FILE="$APP_DIR/.env"

echo "=== Deploy started at $(date) ==="

# Verify .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Copy deploy/.env.example to $ENV_FILE and fill in values."
  exit 1
fi

# Load env for build-time vars
set -a
source "$ENV_FILE"
set +a

# Auto-generate ENCRYPTION_KEY if not set (required for BYOK AI)
if [ -z "${ENCRYPTION_KEY:-}" ]; then
  GENERATED_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  echo "" >> "$ENV_FILE"
  echo "# Auto-generated on $(date)" >> "$ENV_FILE"
  echo "ENCRYPTION_KEY=$GENERATED_KEY" >> "$ENV_FILE"
  echo "Generated ENCRYPTION_KEY and appended to .env"
  export ENCRYPTION_KEY="$GENERATED_KEY"
fi

# Pull latest code
cd "$REPO_DIR"
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build (pass build-time env vars for Vite)
echo "Building..."
VITE_RECAPTCHA_SITE_KEY="${VITE_RECAPTCHA_SITE_KEY:-}" npm run build

# Push schema to database (idempotent — safe to run every deploy)
echo "Pushing database schema..."
npx drizzle-kit push

# Copy NGINX config
echo "Updating NGINX config..."
sudo cp "$REPO_DIR/deploy/nginx.conf" /etc/nginx/conf.d/meshwork.conf
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
sudo nginx -t && sudo systemctl reload nginx

# Restart app via PM2
echo "Restarting app..."
cd "$APP_DIR"
if pm2 describe meshwork > /dev/null 2>&1; then
  pm2 restart meshwork --update-env
else
  pm2 start "$REPO_DIR/dist/index.cjs" --name meshwork --cwd "$APP_DIR"
fi

# Save PM2 config for auto-restart on reboot
pm2 save

# Quick health check
echo "Waiting for app to start..."
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "✓ Health check passed!"
else
  echo "⚠ Health check returned status $STATUS — check pm2 logs meshwork"
fi

echo "=== Deploy complete at $(date) ==="