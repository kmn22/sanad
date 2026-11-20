#!/usr/bin/env bash
# Maqar post-deployment smoke test runner.
#
# Usage:
#   bash scripts/maqar-smoke-test.sh [BASE_URL]
#
# Anonymous HTTP checks always run. The complete browser/authenticated gate runs
# when E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD are provided.

set -uo pipefail

BASE_URL="${1:-${MAQAR_BASE_URL:-http://127.0.0.1:${PORT:-3001}}}"
BASE_URL="${BASE_URL%/}"
PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '  [PASS] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '  [FAIL] %s\n' "$1" >&2
}

check_status() {
  local route="$1"
  local expected="$2"
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$BASE_URL$route" 2>/dev/null || printf '000')
  if [[ "$status" == "$expected" ]]; then
    pass "GET $route returned HTTP $status"
  else
    fail "GET $route returned HTTP $status (expected $expected)"
  fi
}

echo "============================================================================"
echo "  Maqar (مقر) — Complete Post-Deployment Smoke Verification"
echo "  Target URL : $BASE_URL"
echo "  Timestamp  : $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================================"

echo ""
echo "▶ Anonymous HTTP gate"

HEALTH_BODY=$(curl -sS --max-time 20 "$BASE_URL/api/health" 2>/dev/null || true)
HEALTH_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$BASE_URL/api/health" 2>/dev/null || printf '000')
if [[ "$HEALTH_STATUS" == "200" ]]; then
  pass "GET /api/health returned HTTP 200"
else
  fail "GET /api/health returned HTTP $HEALTH_STATUS"
fi

for marker in '"status":"ok"' '"database":"ok"' '"queue":{"status":"ok"'; do
  if grep -Fq "$marker" <<<"$HEALTH_BODY"; then
    pass "/api/health contains $marker"
  else
    fail "/api/health is missing $marker"
  fi
done

ROOT_BODY=$(curl -sS --max-time 20 "$BASE_URL/" 2>/dev/null || true)
ROOT_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$BASE_URL/" 2>/dev/null || printf '000')
if [[ "$ROOT_STATUS" == "200" ]] && grep -q 'dir="rtl"' <<<"$ROOT_BODY"; then
  pass "GET / renders Arabic RTL document"
else
  fail "GET / did not return HTTP 200 with dir=\"rtl\""
fi

for route in /about /ai-disclosure /forgot-password /login /pricing /privacy /privacy/request /register /reset-password /security /terms /verify-email; do
  check_status "$route" "200"
done

for route in /onboarding /sandbox /build /api-docs /solutions/enterprise /student; do
  check_status "$route" "404"
done

for route in /api/zatca /api/ai/legal-query; do
  check_status "$route" "401"
done

CLAUSE_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 -X POST -H "Content-Type: application/json" -d '{"clauseText":"تحدد فترة التجربة بمائة وثمانين (180) يوماً من تاريخ المباشرة."}' "$BASE_URL/api/ai/check-clause" 2>/dev/null || printf '000')
if [[ "$CLAUSE_STATUS" == "200" ]]; then
  pass "POST /api/ai/check-clause returned HTTP 200"
else
  fail "POST /api/ai/check-clause returned HTTP $CLAUSE_STATUS (expected 200)"
fi

for route in /manifest.json /og-preview.png /robots.txt /sitemap.xml /sw.js; do
  check_status "$route" "200"
done

echo ""
if [[ -n "${E2E_OWNER_EMAIL:-}" && -n "${E2E_OWNER_PASSWORD:-}" ]]; then
  echo "▶ Complete browser/authenticated gate"
  if E2E_BASE_URL="$BASE_URL" npx playwright test e2e/maqar-complete-smoke.spec.ts; then
    pass "Complete Playwright smoke gate passed"
  else
    fail "Complete Playwright smoke gate failed"
  fi
else
  echo "▶ Complete browser/authenticated gate skipped"
  echo "  Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD to run it."
fi

echo ""
echo "============================================================================"
echo "  Smoke Verification Summary: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "============================================================================"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
