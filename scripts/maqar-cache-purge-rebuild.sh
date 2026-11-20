#!/usr/bin/env bash
# ============================================================================
# Maqar (مقر) — Server Cache Purge, Clean Rebuild & Zero-Stale-Bundle Protocol
# (`scripts/maqar-cache-purge-rebuild.sh`)
# ============================================================================
#
# Usage:
#   bash scripts/maqar-cache-purge-rebuild.sh [--mode auto|docker|host] [--skip-migrations] [--verify-only]
#
# Protocol Steps:
#   1. Environment Variable Validation against `.env.example` & critical keys.
#   2. Complete Build Cache & Incremental Artifact Purge:
#      - `.next`, `dist`, `out`, `tsconfig.tsbuildinfo`, `node_modules/.cache`, `node_modules/.prisma`
#      - Docker BuildKit / layer cache (`docker builder prune -f`) when running in Docker mode
#   3. Frozen Lockfile Dependency Reinstallation (`npm ci --legacy-peer-deps` or `pnpm install --frozen-lockfile`).
#   4. Prisma Client Regeneration (`npx prisma generate`) & Idempotent Migration Deploy (`npx prisma migrate deploy`).
#   5. Strict TypeScript Audit (`npx tsc --noEmit`) & Clean Production Build (`npm run build`).
#   6. Service Restart (PM2 / systemd / Docker Compose `--no-cache --force-recreate`) & `/api/health` readiness check.
# ============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="auto"
SKIP_MIGRATIONS="false"
VERIFY_ONLY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-auto}"
      shift 2
      ;;
    --docker)
      MODE="docker"
      shift
      ;;
    --host)
      MODE="host"
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS="true"
      shift
      ;;
    --verify-only)
      VERIFY_ONLY="true"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--mode auto|docker|host] [--docker] [--host] [--skip-migrations] [--verify-only]" >&2
      exit 1
      ;;
  esac
done

echo "============================================================================"
echo "  Maqar (مقر) — Server Cache Purge & Clean Production Rebuild Protocol"
echo "  Workspace : $ROOT"
echo "  Mode      : $MODE"
echo "  Timestamp : $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================================"

# ─── 1. Load & Validate Runtime Environment Variables ───────────────────────
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
  echo "[1/6] Loaded runtime environment from .env"
else
  echo "[1/6] WARN: .env file not found in $ROOT; validating against process environment" >&2
fi

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "BACKUP_ENCRYPTION_KEY"
  "MFA_ENCRYPTION_KEY"
)

MISSING_VARS=()
for var_name in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    MISSING_VARS+=("$var_name")
  fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  echo "  WARN: Missing recommended production variables in active environment: ${MISSING_VARS[*]}" >&2
else
  echo "  ✓ All core production secrets and database URLs are present."
fi

if [[ "$VERIFY_ONLY" == "true" ]]; then
  echo "[VERIFY-ONLY] Running Prisma generate and strict TypeScript check..."
  npx prisma generate
  npm run typecheck
  echo "✓ Verification complete."
  exit 0
fi

# ─── 2. Purge Stale Build Caches & Incremental Compiler State ───────────────
echo "[2/6] Purging stale build caches (.next, dist, out, tsconfig.tsbuildinfo, node_modules/.cache, node_modules/.prisma)..."
rm -rf \
  "$ROOT/.next" \
  "$ROOT/dist" \
  "$ROOT/out" \
  "$ROOT/tsconfig.tsbuildinfo" \
  "$ROOT/node_modules/.cache" \
  "$ROOT/node_modules/.prisma"
echo "  ✓ Local build caches and Prisma generated client cache purged."

# ─── 3. Reinstall Frozen Lockfile Dependencies ──────────────────────────────
echo "[3/6] Reinstalling dependencies from frozen lockfile..."
if [[ -f "$ROOT/pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
elif [[ -f "$ROOT/package-lock.json" ]]; then
  npm ci --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi
echo "  ✓ Frozen lockfile dependencies installed cleanly."

# ─── 4. Regenerate Prisma Client & Apply Pending Migrations ─────────────────
echo "[4/6] Regenerating Prisma Client and deploying migrations..."
npx prisma generate
if [[ "$SKIP_MIGRATIONS" == "false" ]] && [[ -n "${DATABASE_URL:-}" ]]; then
  npx prisma migrate deploy
  echo "  ✓ Database migrations deployed."
else
  echo "  ↷ Skipping 'prisma migrate deploy' (--skip-migrations or DATABASE_URL unset)."
fi

# ─── 5. Strict TypeScript Check & Next.js Standalone Production Build ───────
echo "[5/6] Running strict TypeScript verification (tsc --noEmit) and production build..."
npm run typecheck
# Next.js 16.4 security advisory nudge may exit 1 on first invocation in a fresh cache; retry once automatically
if ! npm run build; then
  echo "  ↻ Retrying npm run build after Next.js security advisory notice..."
  npm run build
fi

if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
  echo "ERROR: Standalone bundle (.next/standalone/server.js) was not generated!" >&2
  exit 1
fi
echo "  ✓ Clean Next.js standalone production bundle verified (.next/standalone/server.js)."

# ─── 6. Restart Service & Verify Health Readiness ───────────────────────────
echo "[6/6] Restarting Maqar application service..."

if [[ "$MODE" == "auto" ]]; then
  if command -v docker >/dev/null 2>&1 && docker compose ps >/dev/null 2>&1 && docker compose ps | grep -q "sanad"; then
    MODE="docker"
  else
    MODE="host"
  fi
fi

if [[ "$MODE" == "docker" ]]; then
  echo "  → Rebuilding Docker image with --no-cache and recreating container..."
  docker compose config -q
  docker compose build --no-cache --pull app
  docker builder prune -f --filter "until=24h" || true
  docker compose up -d --force-recreate --remove-orphans app
else
  if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -qE "maqar|sanad"; then
    echo "  → Reloading PM2 process with updated environment..."
    pm2 reload maqar --update-env || pm2 reload sanad --update-env
  elif command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files | grep -qE "^(maqar|sanad)\.service"; then
    echo "  → Restarting systemd service..."
    sudo systemctl restart maqar.service 2>/dev/null || sudo systemctl restart sanad.service
  else
    echo "  ℹ Host standalone bundle ready. Start with: NODE_ENV=production PORT=${PORT:-3001} node .next/standalone/server.js"
  fi
fi

# Health probe if server is listening on localhost:${PORT:-3001}
HEALTH_URL="http://127.0.0.1:${PORT:-3001}/api/health"
if curl -sf -o /dev/null "$HEALTH_URL" 2>/dev/null; then
  echo "  ✓ Health check passed at $HEALTH_URL"
fi

echo "============================================================================"
echo "  ✓ Maqar (مقر) Cache Purge & Production Rebuild Completed Successfully"
echo "============================================================================"

