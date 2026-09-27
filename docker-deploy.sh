#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== [SANAD] Starting Safe Automated Docker Deploy ==="
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="$ROOT/prisma/db/custom.db"

# 1. Validate required environment
if [ -z "${NEXTAUTH_SECRET:-}" ]; then
  echo "ERROR: NEXTAUTH_SECRET is not set in the environment." >&2
  exit 1
fi

# 2. Take safety backup of database
mkdir -p "$ROOT/../sanad_backups"
if [ -f "$DB_FILE" ]; then
  cp "$DB_FILE" "$ROOT/../sanad_backups/custom_${TIMESTAMP}.db"
  echo "✓ Database backup saved to $ROOT/../sanad_backups/custom_${TIMESTAMP}.db"
fi

# 3. Pull latest code from GitHub (abort if the working tree is dirty)
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is dirty. Commit or stash changes before deploying." >&2
  git status --short >&2
  exit 1
fi
git pull origin main

# 4. Migrate database schema safely (DATABASE_URL relative to prisma/)
DATABASE_URL="file:./db/custom.db" npx prisma db push

# 5. Validate Compose config and rebuild
docker compose config -q
docker compose build app

# 6. Recreate container
docker compose up -d app

# 7. Wait for the app to be ready (up to ~60s)
echo "Waiting for sanad-web to become healthy..."
for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://localhost:3001/api/health; then
    echo "✓ sanad-web is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: sanad-web did not become healthy in time. Check: docker compose logs app" >&2
    exit 1
  fi
  sleep 2
done

echo "=== [SANAD] Docker Deployment Completed Successfully! ==="
docker compose ps
