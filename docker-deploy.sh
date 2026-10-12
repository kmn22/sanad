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

# 2. Take safety backup of database (encrypted when BACKUP_ENCRYPTION_KEY is set)
mkdir -p "$ROOT/../sanad_backups"
docker compose up -d db
DUMP_FILE="$ROOT/../sanad_backups/sanad_${TIMESTAMP}.dump"
docker exec sanad-postgres pg_dump -U sanad -d sanad -Fc > "$DUMP_FILE"
if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$DUMP_FILE" -out "$DUMP_FILE.enc" -pass env:BACKUP_ENCRYPTION_KEY
  rm -f "$DUMP_FILE"
  echo "✓ Encrypted database backup saved to ${DUMP_FILE}.enc"
else
  echo "WARN: BACKUP_ENCRYPTION_KEY unset — pre-deploy dump left unencrypted on disk" >&2
  echo "✓ Database backup saved to $DUMP_FILE"
fi
# Retain 30 days of pre-deploy dumps
find "$ROOT/../sanad_backups" -type f \( -name 'sanad_*.dump' -o -name 'sanad_*.dump.enc' \) -mtime +30 -delete

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
