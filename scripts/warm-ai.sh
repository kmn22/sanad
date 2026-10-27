#!/usr/bin/env bash
# Pre-loads the local Ollama model into GPU memory so the first real user
# request does not pay the ~12-17s cold-start cost. Safe to run repeatedly
# (deploy hook + periodic cron). Never fails the caller if Ollama is down.

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env"
  set +a
fi

OLLAMA_HOST_URL="${OLLAMA_HOST_URL:-http://127.0.0.1:11434}"
MODEL="${OLLAMA_MODEL:-qwen3-coder:30b}"

echo "[$(date -Is)] warming $MODEL at $OLLAMA_HOST_URL"
START=$(date +%s)
if curl -fsS -m 300 "$OLLAMA_HOST_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"$MODEL\",\"keep_alive\":\"24h\",\"stream\":false,\"options\":{\"num_ctx\":4096},\"messages\":[{\"role\":\"user\",\"content\":\"مرحبا\"}]}" \
  -o /dev/null; then
  echo "[$(date -Is)] ✓ $MODEL resident ($(( $(date +%s) - START ))s)"
else
  echo "[$(date -Is)] ✗ warm-up failed (Ollama unreachable or model missing) — continuing" >&2
fi
