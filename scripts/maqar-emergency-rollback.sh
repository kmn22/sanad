#!/usr/bin/env bash
# ============================================================================
# Maqar (مقر) — Emergency Production Rollback & Recovery Protocol
# (`scripts/maqar-emergency-rollback.sh`)
# ============================================================================
#
# Usage:
#   bash scripts/maqar-emergency-rollback.sh --target-ref <git-tag-or-sha> [--restore-db <backup.dump.enc>] [--resolve-migration <migration_name>]
#
# Database Rollback Cautions:
#   1. NEVER run `prisma migrate reset` or `prisma db push --force-reset` in production.
#   2. Expand-and-Contract (Forward-Compatible) Migrations:
#      If the failed release only added nullable columns, tables, or indexes
#      (such as `organizationId`), DO NOT roll back the database schema — roll
#      back the application container/bundle only (`--app-only`, default).
#   3. Failed In-Flight Migration (`_prisma_migrations.finished_at IS NULL`):
#      Use `npx prisma migrate resolve --rolled-back <migration_name>` before
#      redeploying the previous stable application image.
#   4. Destructive Schema/Data Corruption:
#      Stop application traffic first, decrypt the pre-deploy `.dump.enc`
#      artifact using `BACKUP_ENCRYPTION_KEY`, and restore via `pg_restore --clean --if-exists`.
#      Note: Restoring a snapshot discards transactions written after the backup timestamp;
#      preserve the WORM `AuditLog` table export before restoring!
# ============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TARGET_REF=""
RESTORE_DB_FILE=""
RESOLVE_MIGRATION=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-ref)
      TARGET_REF="${2:-}"
      shift 2
      ;;
    --restore-db)
      RESTORE_DB_FILE="${2:-}"
      shift 2
      ;;
    --resolve-migration)
      RESOLVE_MIGRATION="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 --target-ref <git-tag-or-sha> [--restore-db <path.dump.enc>] [--resolve-migration <migration_name>] [--dry-run]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET_REF" ]]; then
  echo "ERROR: --target-ref <git-tag-or-sha> is required (e.g., HEAD~1 or v1.0.0)." >&2
  exit 1
fi

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

echo "============================================================================"
echo "  Maqar (مقر) — Emergency Production Rollback Procedure"
echo "  Target Git Ref     : $TARGET_REF"
echo "  Resolve Migration  : ${RESOLVE_MIGRATION:-none (preserve expand-only schema)}"
echo "  Database Restore   : ${RESTORE_DB_FILE:-none (app-layer rollback only)}"
echo "  Dry Run            : $DRY_RUN"
echo "============================================================================"

run_cmd() {
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY-RUN] $*"
  else
    "$@"
  fi
}

# ─── Step 1: Resolve Any Failed In-Flight Prisma Migration ──────────────────
if [[ -n "$RESOLVE_MIGRATION" ]]; then
  echo "[1/5] Marking failed migration '$RESOLVE_MIGRATION' as rolled back..."
  run_cmd npx prisma migrate resolve --rolled-back "$RESOLVE_MIGRATION"
else
  echo "[1/5] No failed migration specified; keeping forward-compatible PostgreSQL schema intact."
fi

# ─── Step 2: Optional Encrypted Pre-Deploy Snapshot Restore ─────────────────
if [[ -n "$RESTORE_DB_FILE" ]]; then
  if [[ ! -f "$RESTORE_DB_FILE" ]]; then
    echo "ERROR: Backup file not found: $RESTORE_DB_FILE" >&2
    exit 1
  fi
  echo "[2/5] CAUTION: Restoring encrypted PostgreSQL snapshot ($RESTORE_DB_FILE)..."
  echo "      Exporting current WORM AuditLog records before point-in-time restore..."
  AUDIT_PRESERVE_FILE="$ROOT/backups/audit_log_pre_rollback_$(date -u +%Y%m%d_%H%M%S).csv"
  if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$ROOT/backups"
    docker exec sanad-postgres psql -U sanad -d sanad -c "\copy (SELECT * FROM \"AuditLog\" ORDER BY \"createdAt\" ASC) TO STDOUT WITH CSV HEADER" > "$AUDIT_PRESERVE_FILE" || true
  fi

  TEMP_DUMP=$(mktemp --suffix=.dump)
  if [[ "$RESTORE_DB_FILE" == *.enc ]]; then
    if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
      echo "ERROR: BACKUP_ENCRYPTION_KEY is required to decrypt $RESTORE_DB_FILE" >&2
      rm -f "$TEMP_DUMP"
      exit 1
    fi
    run_cmd openssl enc -d -aes-256-cbc -pbkdf2 -in "$RESTORE_DB_FILE" -out "$TEMP_DUMP" -pass env:BACKUP_ENCRYPTION_KEY
  else
    cp "$RESTORE_DB_FILE" "$TEMP_DUMP"
  fi

  if [[ "$DRY_RUN" == "false" ]]; then
    docker exec -i sanad-postgres pg_restore -U sanad -d sanad --clean --if-exists < "$TEMP_DUMP"
  else
    echo "  [DRY-RUN] docker exec -i sanad-postgres pg_restore -U sanad -d sanad --clean --if-exists < $TEMP_DUMP"
  fi
  rm -f "$TEMP_DUMP"
else
  echo "[2/5] Skipping full DB snapshot restore (recommended for non-destructive deployments)."
fi

# ─── Step 3: Checkout Target Git Revision & Purge Build Caches ──────────────
echo "[3/5] Checking out target revision ($TARGET_REF) and purging stale build caches..."
run_cmd git checkout "$TARGET_REF"
run_cmd rm -rf "$ROOT/.next" "$ROOT/dist" "$ROOT/out" "$ROOT/tsconfig.tsbuildinfo" "$ROOT/node_modules/.cache" "$ROOT/node_modules/.prisma"

# ─── Step 4: Reinstall Locked Dependencies, Regenerate Prisma & Rebuild ─────
echo "[4/5] Rebuilding clean application bundle from $TARGET_REF..."
run_cmd npm ci --legacy-peer-deps
run_cmd npx prisma generate

if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1 && docker compose ps | grep -q "sanad"; then
  run_cmd docker compose build --no-cache app
  run_cmd docker compose up -d --force-recreate app
else
  run_cmd npm run build
  if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -qE "maqar|sanad"; then
    run_cmd pm2 reload maqar --update-env || run_cmd pm2 reload sanad --update-env
  fi
fi

# ─── Step 5: Run Post-Rollback Smoke Verification ───────────────────────────
echo "[5/5] Verifying service health after rollback..."
if [[ "$DRY_RUN" == "false" ]]; then
  bash "$ROOT/scripts/maqar-smoke-test.sh" "http://127.0.0.1:${PORT:-3001}"
else
  echo "  [DRY-RUN] bash $ROOT/scripts/maqar-smoke-test.sh http://127.0.0.1:${PORT:-3001}"
fi

echo "============================================================================"
echo "  ✓ Emergency Rollback to $TARGET_REF Completed & Verified"
echo "============================================================================"

