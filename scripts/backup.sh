#!/bin/bash
# On-demand backup script used by /api/backup (and can be run manually).
# Keeps the last 30 days of backups under <project>/backups/.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_FILE="$PROJECT_DIR/prisma/db/custom.db"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sanad-$DATE.db"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "ERROR: Database file not found: $DB_FILE" >&2
  exit 1
fi

if command -v sqlite3 &>/dev/null; then
  sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
elif command -v python3 &>/dev/null; then
  python3 -c '
import sqlite3, sys
src = sqlite3.connect(sys.argv[1])
dst = sqlite3.connect(sys.argv[2])
src.backup(dst)
dst.close()
src.close()
' "$DB_FILE" "$BACKUP_FILE"
else
  cp "$DB_FILE" "$BACKUP_FILE"
fi

gzip -f "$BACKUP_FILE"

echo "[$(date)] Backup created: $BACKUP_FILE.gz ($(du -h "$BACKUP_FILE.gz" | cut -f1))"

find "$BACKUP_DIR" -name 'sanad-*.db.gz' -mtime +30 -delete
echo "[$(date)] Old backups cleaned (kept last 30 days)"
