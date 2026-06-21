#!/bin/bash
# Sanad — Database Backup Script
# Add to crontab for automated backups:
#   0 2 * * * /home/z/my-project/scripts/backup-db.sh
#
# Keeps last 30 days of backups.

set -euo pipefail

PROJECT_DIR="/home/z/my-project"
DB_FILE="$PROJECT_DIR/db/custom.db"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sanad-$DATE.db"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check database exists
if [ ! -f "$DB_FILE" ]; then
  echo "ERROR: Database file not found: $DB_FILE"
  exit 1
fi

# Create backup using SQLite's online backup (safe even if app is running)
# Falls back to file copy if sqlite3 CLI is not available
if command -v sqlite3 &>/dev/null; then
  sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
else
  cp "$DB_FILE" "$BACKUP_FILE"
fi

# Compress
gzip -f "$BACKUP_FILE"

echo "[$(date)] Backup created: $BACKUP_FILE.gz ($(du -h $BACKUP_FILE.gz | cut -f1))"

# Clean up backups older than 30 days
find "$BACKUP_DIR" -name "sanad-*.db.gz" -mtime +30 -delete
echo "[$(date)] Old backups cleaned (kept last 30 days)"

# List recent backups
echo "Recent backups:"
ls -lht "$BACKUP_DIR"/sanad-*.db.gz 2>/dev/null | head -5
