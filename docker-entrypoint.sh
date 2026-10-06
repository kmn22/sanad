#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying database migrations via prisma migrate deploy..."
  npx prisma migrate deploy || {
    echo "[entrypoint] Migration failed. Exiting."
    exit 1
  }
fi

echo "[entrypoint] Starting Sanad Production Server on port ${PORT:-3001}..."
exec node server.js
