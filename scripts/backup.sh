#!/bin/bash
# scripts/backup.sh
# Simple SQLite backup script

set -e

DB_FILE="prisma/db/custom.db"
BACKUP_DIR="backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/sanad_backup_$DATE.db"

mkdir -p $BACKUP_DIR

# Using sqlite3 online backup API via CLI
echo "Starting backup of $DB_FILE..."
sqlite3 $DB_FILE ".backup '$BACKUP_FILE'"

# Compress the backup
gzip $BACKUP_FILE

echo "Backup completed successfully: $BACKUP_FILE.gz"
