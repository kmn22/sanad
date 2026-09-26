#!/usr/bin/env bash
set -e

echo "=== [SANAD] Starting Safe Automated Docker Deploy ==="
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 1. Take safety backup of database
mkdir -p /home/khaled/sanad_backups
if [ -f /home/khaled/sanad/db/custom.db ]; then
  cp /home/khaled/sanad/db/custom.db /home/khaled/sanad_backups/custom_${TIMESTAMP}.db
  echo "✓ Database backup saved to /home/khaled/sanad_backups/custom_${TIMESTAMP}.db"
fi

# 2. Pull latest code from GitHub
cd /home/khaled/sanad
git pull origin main

# 3. Migrate database schema safely
DATABASE_URL="file:/home/khaled/sanad/db/custom.db" npx prisma db push

# 4. Rebuild & restart Docker container
docker compose build sanad
docker compose up -d sanad

echo "=== [SANAD] Docker Deployment Completed Successfully! ==="
docker compose ps
