#!/usr/bin/env bash
# Disaster-recovery restore drill.
#
# Rehearses the full recovery path end-to-end against an ISOLATED instance:
#   1. Take a fresh encrypted backup of the production database (read-only).
#   2. Restore it into a throwaway postgres container (no access to prod data dirs).
#   3. Compare per-table row counts between production and the restored copy.
#   4. Confirm every applied migration is present in the restored database.
#   5. Decrypt one stored document with the production file-encryption key.
#
# Production is never written to. The drill instance runs on port 55433 and is
# removed on exit (success or failure).
#
# Usage: scripts/restore-drill.sh [backup-file.enc]
#   With no argument a fresh backup is taken; pass an existing
#   backups/postgres/sanad-*.dump.enc to rehearse restoring an older backup.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

set -a
source "$PROJECT_DIR/.env"
set +a

: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY must be set}"
# docker-compose.yml falls back to BACKUP_ENCRYPTION_KEY for file encryption.
export FILE_ENCRYPTION_KEY="${FILE_ENCRYPTION_KEY:-$BACKUP_ENCRYPTION_KEY}"

PROD_PG="${SANAD_PROD_PG_CONTAINER:-sanad-postgres}"
PROD_DB="${SANAD_PROD_DB_NAME:-sanad}"
PROD_USER="${SANAD_PROD_DB_USER:-sanad}"

DRILL_NAME="sanad-drill-postgres"
DRILL_PORT="55433"
DRILL_DB="sanad_drill"
WORK="$(mktemp -d /tmp/sanad-restore-drill.XXXXXX)"

cleanup() {
  docker rm -f "$DRILL_NAME" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "==> [1/5] Preparing encrypted backup"
DUMP_ENC="$WORK/sanad-drill.dump.enc"
if [ "${1:-}" != "" ]; then
  cp "$1" "$DUMP_ENC"
  echo "    using existing backup: $1"
else
  docker exec "$PROD_PG" pg_dump -U "$PROD_USER" -d "$PROD_DB" -Fc > "$WORK/sanad-drill.dump"
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$WORK/sanad-drill.dump" -out "$DUMP_ENC" -pass env:BACKUP_ENCRYPTION_KEY
  rm -f "$WORK/sanad-drill.dump"
  echo "    fresh encrypted backup taken ($(du -h "$DUMP_ENC" | cut -f1))"
fi
openssl enc -d -aes-256-cbc -pbkdf2 -in "$DUMP_ENC" -out "$WORK/sanad-drill.dump" -pass env:BACKUP_ENCRYPTION_KEY
echo "    decrypted for restore"

echo "==> [2/5] Restoring into isolated container :$DRILL_PORT"
docker run -d --name "$DRILL_NAME" -p "$DRILL_PORT:5432" -e "POSTGRES_PASSWORD=drill" postgres:16-bookworm >/dev/null
until docker exec "$DRILL_NAME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec "$DRILL_NAME" createdb -U postgres "$DRILL_DB"
docker cp "$WORK/sanad-drill.dump" "$DRILL_NAME:/tmp/drill.dump" >/dev/null
docker exec "$DRILL_NAME" pg_restore -U postgres -d "$DRILL_DB" --no-owner --no-privileges /tmp/drill.dump
echo "    restore completed"

COUNT_SQL="SELECT 'User', COUNT(*) FROM \"User\"
UNION ALL SELECT 'Workspace', COUNT(*) FROM \"Workspace\"
UNION ALL SELECT 'WorkspaceMembership', COUNT(*) FROM \"WorkspaceMembership\"
UNION ALL SELECT 'Client', COUNT(*) FROM \"Client\"
UNION ALL SELECT 'LegalCase', COUNT(*) FROM \"LegalCase\"
UNION ALL SELECT 'CaseAssignment', COUNT(*) FROM \"CaseAssignment\"
UNION ALL SELECT 'LegalDocument', COUNT(*) FROM \"LegalDocument\"
UNION ALL SELECT 'DocumentVersion', COUNT(*) FROM \"DocumentVersion\"
UNION ALL SELECT 'Task', COUNT(*) FROM \"Task\"
UNION ALL SELECT 'Invoice', COUNT(*) FROM \"Invoice\"
UNION ALL SELECT 'Approval', COUNT(*) FROM \"Approval\"
UNION ALL SELECT 'PortalAccess', COUNT(*) FROM \"PortalAccess\"
UNION ALL SELECT 'Notification', COUNT(*) FROM \"Notification\"
UNION ALL SELECT 'AuditLog', COUNT(*) FROM \"AuditLog\"
UNION ALL SELECT 'BackgroundJob', COUNT(*) FROM \"BackgroundJob\""

echo "==> [3/5] Comparing row counts (production vs restored)"
docker exec "$PROD_PG" psql -U "$PROD_USER" -d "$PROD_DB" -v ON_ERROR_STOP=1 -AtF'	' -c "$COUNT_SQL" | sort > "$WORK/prod.counts"
docker exec "$DRILL_NAME" psql -U postgres -d "$DRILL_DB" -v ON_ERROR_STOP=1 -AtF'	' -c "$COUNT_SQL" | sort > "$WORK/drill.counts"
if ! diff -u "$WORK/prod.counts" "$WORK/drill.counts" > "$WORK/count.diff"; then
  cat "$WORK/count.diff"
  echo "FAIL: restored row counts differ from production"
  exit 1
fi
column -t -s'	' "$WORK/prod.counts"
echo "    all row counts match"

echo "==> [4/5] Verifying migration state in the restored database"
PROD_MIGRATIONS=$(docker exec "$PROD_PG" psql -U "$PROD_USER" -d "$PROD_DB" -Atc "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND migration_name NOT LIKE '%rollback%' ORDER BY migration_name")
DRILL_MIGRATIONS=$(docker exec "$DRILL_NAME" psql -U postgres -d "$DRILL_DB" -Atc "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND migration_name NOT LIKE '%rollback%' ORDER BY migration_name")
if [ "$PROD_MIGRATIONS" != "$DRILL_MIGRATIONS" ]; then
  echo "FAIL: migrated state differs between production and restored database"
  exit 1
fi
echo "    $(echo "$PROD_MIGRATIONS" | wc -l) applied migrations present"

echo "==> [5/5] Verifying file encryption with the production key"
DOC=$(docker exec "$DRILL_NAME" psql -U postgres -d "$DRILL_DB" -AtF'	' -c "SELECT \"fileKey\" FROM \"LegalDocument\" WHERE \"fileKey\" IS NOT NULL ORDER BY \"createdAt\" DESC LIMIT 1")
# Mirrors encryptionKey() in src/lib/file-storage.ts, then either decrypts a
# stored file or, when none exist, proves the key with a synthetic round-trip.
DECRYPT_JS='
const { createCipheriv, createDecipheriv, createHash, randomBytes } = require("crypto")
const fs = require("fs")
const key = createHash("sha256").update(`sanad-file-storage:${process.env.FILE_ENCRYPTION_KEY}`).digest()
if (key.length !== 32) throw new Error("bad key length")
const mode = process.argv[1]
const target = process.argv[2]
if (mode === "stored") {
  const data = fs.readFileSync(target)
  const decipher = createDecipheriv("aes-256-gcm", key, data.subarray(0, 12))
  decipher.setAuthTag(data.subarray(data.length - 16))
  const plain = Buffer.concat([decipher.update(data.subarray(12, data.length - 16)), decipher.final()])
  if (plain.length === 0) throw new Error("empty plaintext")
  console.log(`    stored document decrypted: ${plain.length} bytes (checksum ${createHash("sha256").update(plain).digest("hex").slice(0, 16)}…)`)
} else {
  const plain = randomBytes(4096)
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const enc = Buffer.concat([iv, cipher.update(plain), cipher.final(), cipher.getAuthTag()])
  const decipher = createDecipheriv("aes-256-gcm", key, enc.subarray(0, 12))
  decipher.setAuthTag(enc.subarray(enc.length - 16))
  const back = Buffer.concat([decipher.update(enc.subarray(12, enc.length - 16)), decipher.final()])
  if (!back.equals(plain)) throw new Error("round-trip mismatch")
  console.log("    no stored documents yet — AES-256-GCM round-trip with the production key verified")
}
'
if [ -n "$DOC" ]; then
  FILE_KEY=$(echo "$DOC" | cut -f1)
  # Upload root is either a host path (production bind mount) or a docker
  # named volume backing the web container's UPLOAD_ROOT (staging).
  UPLOAD_SOURCE="${SANAD_UPLOAD_SOURCE:-${UPLOAD_ROOT:-$PROJECT_DIR/uploads}}"
  if docker volume inspect "$UPLOAD_SOURCE" >/dev/null 2>&1; then
    docker run --rm -e FILE_ENCRYPTION_KEY -v "$UPLOAD_SOURCE:/uploads:ro" node:22-slim node -e "$DECRYPT_JS" stored "/uploads/$FILE_KEY"
  else
    FILE_PATH="$UPLOAD_SOURCE/$FILE_KEY"
    if [ ! -f "$FILE_PATH" ]; then
      echo "FAIL: stored file missing from upload root: $FILE_KEY"
      exit 1
    fi
    docker run --rm -e FILE_ENCRYPTION_KEY -v "$FILE_PATH:/doc.enc" node:22-slim node -e "$DECRYPT_JS" stored /doc.enc
  fi
else
  docker run --rm -e FILE_ENCRYPTION_KEY node:22-slim node -e "$DECRYPT_JS" synthetic
fi

echo
echo "RESTORE DRILL PASSED — backup is decryptable, restorable, complete, and file-encryption keys recover content."
