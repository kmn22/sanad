#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== [SANAD] Starting Safe Automated Docker Deploy ==="
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="$ROOT/prisma/db/custom.db"

# 1. Take safety backup of database
mkdir -p "$ROOT/../sanad_backups"
if [ -f "$DB_FILE" ]; then
  cp "$DB_FILE" "$ROOT/../sanad_backups/custom_${TIMESTAMP}.db"
  echo "✓ Database backup saved to $ROOT/../sanad_backups/custom_${TIMESTAMP}.db"
fi

# 2. Pull latest code from GitHub
git pull origin main

# 3. Migrate database schema safely
DATABASE_URL="file:./db/custom.db" npx prisma db push

# 4. Rebuild & restart Docker container
docker compose build app
docker compose up -d app

echo "=== [SANAD] Docker Deployment Completed Successfully! ==="
docker compose ps
