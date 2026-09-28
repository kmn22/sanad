#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== [SANAD] Starting Safe Automated Docker Deploy ==="
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
set -a
source "$ROOT/.env"
set +a

# 1. Validate required environment
if [ -z "${NEXTAUTH_SECRET:-}" ] || [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "ERROR: NEXTAUTH_SECRET and POSTGRES_PASSWORD must be set." >&2
  exit 1
fi

# 2. Take safety backup of database
mkdir -p "$ROOT/../sanad_backups"
docker compose up -d db
docker exec sanad-postgres pg_dump -U sanad -d sanad -Fc > "$ROOT/../sanad_backups/sanad_${TIMESTAMP}.dump"
echo "✓ Database backup saved to $ROOT/../sanad_backups/sanad_${TIMESTAMP}.dump"

# 3. Pull latest code from GitHub (abort if the working tree is dirty)
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is dirty. Commit or stash changes before deploying." >&2
  git status --short >&2
  exit 1
fi
git pull origin main

# 4. Migrate database schema safely
DATABASE_URL="postgresql://sanad:${POSTGRES_PASSWORD}@127.0.0.1:5432/sanad" npx prisma migrate deploy

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
