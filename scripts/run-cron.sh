#!/usr/bin/env bash
# Executes a scheduled Sanad cron endpoint (/api/cron/jobs or /api/cron/reminders)
# against the local production app container using CRON_SECRET from .env.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENDPOINT="${1:-jobs}"

if [[ "$ENDPOINT" != "jobs" && "$ENDPOINT" != "reminders" ]]; then
  echo "Usage: $0 [jobs|reminders]" >&2
  exit 1
fi

set -a
source "$PROJECT_DIR/.env"
set +a

: "${CRON_SECRET:?CRON_SECRET must be set in .env}"

APP_URL="${SANAD_LOCAL_URL:-http://127.0.0.1:3001}"
curl -fsS -m 60 -X POST \
  -H "x-cron-secret: $CRON_SECRET" \
  "$APP_URL/api/cron/$ENDPOINT"
echo
