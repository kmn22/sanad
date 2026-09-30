#!/bin/sh
set -e

echo "[entrypoint] Starting Sanad Production Server on port ${PORT:-3001}..."
exec node server.js
