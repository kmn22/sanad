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
UPLOAD_DIR="${UPLOAD_ROOT:-$PROJECT_DIR/uploads}"
UPLOAD_ARCHIVE="$BACKUP_DIR/sanad-files-$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Dead-man-switch monitoring: when BACKUP_SUCCESS_URL is set (e.g. an Uptime
# Kuma "push" monitor URL), a successful run pings it — silence or a failure
# ping raises the alert instead of discovery on restore day.
ping_backup_monitor() {
  local url="${BACKUP_SUCCESS_URL:-}"
  [ -n "$url" ] || return 0
  local sep='?'
  case "$url" in *\?*) sep='&' ;; esac
  curl -fsS -m 10 -o /dev/null "${url}${1:+${sep}$1}" 2>/dev/null || echo "WARN: backup monitor ping failed" >&2
}

cleanup() {
  local rc=$?
  rm -f "$DUMP_FILE" "$VERIFY_FILE"
  docker exec sanad-postgres dropdb -U sanad --if-exists "$VERIFY_DB" >/dev/null 2>&1 || true
  docker exec sanad-postgres rm -f "/tmp/$VERIFY_DB.dump" >/dev/null 2>&1 || true
  if [ $rc -ne 0 ]; then
    ping_backup_monitor "status=down&msg=backup-failed"
  fi
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

# File archive: uploaded files are root-owned inside the app container, so
# host-side tar cannot read them — stream the archive out of the container
# instead. A failure here warns but must not abort the (verified) DB backup.
if docker exec sanad-web test -d /app/uploads 2>/dev/null; then
  if docker exec sanad-web tar -C /app/uploads -czf - . > "$UPLOAD_ARCHIVE" 2>/dev/null; then
    sha256sum "$UPLOAD_ARCHIVE" > "$UPLOAD_ARCHIVE.sha256"
  else
    rm -f "$UPLOAD_ARCHIVE"
    echo "WARN: container file-archive failed — uploads not included in this backup" >&2
  fi
elif [ -d "$UPLOAD_DIR" ]; then
  if tar -C "$UPLOAD_DIR" -czf "$UPLOAD_ARCHIVE" . 2>/dev/null; then
    sha256sum "$UPLOAD_ARCHIVE" > "$UPLOAD_ARCHIVE.sha256"
  else
    rm -f "$UPLOAD_ARCHIVE"
    echo "WARN: file-archive failed — uploads not included in this backup" >&2
  fi
fi

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
  if [ -f "$UPLOAD_ARCHIVE" ]; then
    aws "${AWS_ARGS[@]}" s3 cp "$UPLOAD_ARCHIVE" "s3://$S3_BACKUP_BUCKET/sanad/$(basename "$UPLOAD_ARCHIVE")" --only-show-errors
    aws "${AWS_ARGS[@]}" s3 cp "$UPLOAD_ARCHIVE.sha256" "s3://$S3_BACKUP_BUCKET/sanad/$(basename "$UPLOAD_ARCHIVE.sha256")" --only-show-errors
  fi
fi

# Provider-agnostic offload for non-S3 remotes (rclone, s3cmd, scp, ...).
# BACKUP_OFFLOAD_CMD is a shell template: %f expands to the local file path,
# %b to its basename. Example:
#   BACKUP_OFFLOAD_CMD='rclone copyto "%f" remote:sanad-backups/%b'
# Only encrypted artifacts are ever passed to it — same trust level as .env.
if [ -n "${BACKUP_OFFLOAD_CMD:-}" ]; then
  OFFLOAD_FILES=("$ENCRYPTED_FILE" "$ENCRYPTED_FILE.sha256")
  if [ -f "$UPLOAD_ARCHIVE" ]; then
    OFFLOAD_FILES+=("$UPLOAD_ARCHIVE" "$UPLOAD_ARCHIVE.sha256")
  fi
  for f in "${OFFLOAD_FILES[@]}"; do
    cmd="${BACKUP_OFFLOAD_CMD//%f/$f}"
    cmd="${cmd//%b/$(basename "$f")}"
    if ! eval "$cmd"; then
      echo "ERROR: BACKUP_OFFLOAD_CMD failed for $f" >&2
      exit 1
    fi
  done
  printf '[%s] Offloaded %d artifacts via BACKUP_OFFLOAD_CMD\n' "$(date --iso-8601=seconds)" "${#OFFLOAD_FILES[@]}"
fi

find "$BACKUP_DIR" -type f \( -name 'sanad-*.dump.enc' -o -name 'sanad-*.dump.enc.sha256' -o -name 'sanad-files-*.tar.gz' -o -name 'sanad-files-*.tar.gz.sha256' \) -mtime +30 -delete
ping_backup_monitor
printf '[%s] Encrypted backup verified: %s (%s)\n' "$(date --iso-8601=seconds)" "$ENCRYPTED_FILE" "$(du -h "$ENCRYPTED_FILE" | cut -f1)"
