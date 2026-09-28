#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a
source "$PROJECT_DIR/.env"
set +a

: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY must be set}"

BACKUP_DIR="$PROJECT_DIR/backups/postgres"
DATE=$(date +%Y%m%d-%H%M%S)
DUMP_FILE="$BACKUP_DIR/sanad-$DATE.dump"
ENCRYPTED_FILE="$DUMP_FILE.enc"
VERIFY_FILE="$BACKUP_DIR/.verify-$DATE.dump"
VERIFY_DB="sanad_restore_${DATE//-/}"

mkdir -p "$BACKUP_DIR"
cleanup() {
  rm -f "$DUMP_FILE" "$VERIFY_FILE"
  docker exec sanad-postgres dropdb -U sanad --if-exists "$VERIFY_DB" >/dev/null 2>&1 || true
  docker exec sanad-postgres rm -f "/tmp/$VERIFY_DB.dump" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d db >/dev/null
docker exec sanad-postgres pg_dump -U sanad -d sanad -Fc > "$DUMP_FILE"
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$DUMP_FILE" -out "$ENCRYPTED_FILE" -pass env:BACKUP_ENCRYPTION_KEY
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ENCRYPTED_FILE" -out "$VERIFY_FILE" -pass env:BACKUP_ENCRYPTION_KEY
docker cp "$VERIFY_FILE" "sanad-postgres:/tmp/$VERIFY_DB.dump" >/dev/null
docker exec sanad-postgres pg_restore --list "/tmp/$VERIFY_DB.dump" >/dev/null
docker exec sanad-postgres createdb -U sanad "$VERIFY_DB"
docker exec sanad-postgres pg_restore -U sanad -d "$VERIFY_DB" --no-owner --no-privileges "/tmp/$VERIFY_DB.dump"
docker exec sanad-postgres psql -U sanad -d "$VERIFY_DB" -v ON_ERROR_STOP=1 -Atc 'SELECT COUNT(*) FROM "User"; SELECT COUNT(*) FROM "Workspace";' >/dev/null

sha256sum "$ENCRYPTED_FILE" > "$ENCRYPTED_FILE.sha256"

if [ -n "${S3_BACKUP_BUCKET:-}" ]; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: S3_BACKUP_BUCKET is configured but aws CLI is unavailable" >&2
    exit 1
  fi
  AWS_ARGS=()
  if [ -n "${S3_ENDPOINT_URL:-}" ]; then
    AWS_ARGS+=(--endpoint-url "$S3_ENDPOINT_URL")
  fi
  aws "${AWS_ARGS[@]}" s3 cp "$ENCRYPTED_FILE" "s3://$S3_BACKUP_BUCKET/sanad/$(basename "$ENCRYPTED_FILE")" --only-show-errors
  aws "${AWS_ARGS[@]}" s3 cp "$ENCRYPTED_FILE.sha256" "s3://$S3_BACKUP_BUCKET/sanad/$(basename "$ENCRYPTED_FILE.sha256")" --only-show-errors
fi

find "$BACKUP_DIR" -type f \( -name 'sanad-*.dump.enc' -o -name 'sanad-*.dump.enc.sha256' \) -mtime +30 -delete
printf '[%s] Encrypted backup verified: %s (%s)\n' "$(date --iso-8601=seconds)" "$ENCRYPTED_FILE" "$(du -h "$ENCRYPTED_FILE" | cut -f1)"
