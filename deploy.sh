#!/bin/bash
# Sanad — Production Deployment Script
# Suitable for home server deployment (192GB RAM)
#
# Usage:
#   ./deploy.sh           # Full deploy: build + restart
#   ./deploy.sh build     # Build only
#   ./deploy.sh restart   # Restart only (after code changes)
#   ./deploy.sh logs      # View logs
#   ./deploy.sh stop      # Stop server
#   ./deploy.sh status    # Check status

set -euo pipefail

PROJECT_DIR="/home/z/my-project"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN:${NC} $1"; }
err() { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"; }

# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

case "${1:-deploy}" in

  build)
    log "Building Sanad for production..."
    export NODE_ENV=production
    bun run build
    log "Build complete. Output: .next/standalone/"
    ;;

  restart)
    log "Restarting Sanad..."
    if command -v pm2 &>/dev/null; then
      pm2 restart sanad || pm2 start ecosystem.config.cjs --env production
      log "PM2 restart complete."
    else
      pkill -f "standalone/server.js" 2>/dev/null || true
      sleep 2
      NODE_ENV=production nohup bun .next/standalone/server.js > logs/sanad-out.log 2>&1 &
      log "Server started (PID: $!). Logs: logs/sanad-out.log"
    fi
    ;;

  stop)
    log "Stopping Sanad..."
    if command -v pm2 &>/dev/null; then
      pm2 stop sanad
    else
      pkill -f "standalone/server.js" 2>/dev/null || true
    fi
    log "Stopped."
    ;;

  logs)
    if command -v pm2 &>/dev/null; then
      pm2 logs sanad
    else
      tail -f logs/sanad-out.log
    fi
    ;;

  status)
    if command -v pm2 &>/dev/null; then
      pm2 status sanad
    else
      if pgrep -f "standalone/server.js" > /dev/null; then
        log "Server is running (PID: $(pgrep -f 'standalone/server.js'))"
      else
        err "Server is not running."
      fi
    fi
    ;;

  deploy|"")
    log "=== Sanad Production Deploy ==="

    # Step 1: Install dependencies
    log "Step 1/5: Installing dependencies..."
    bun install --frozen-lockfile 2>/dev/null || bun install

    # Step 2: Generate Prisma client
    log "Step 2/5: Generating Prisma client..."
    bun run db:generate

    # Step 3: Build
    log "Step 3/5: Building production bundle..."
    export NODE_ENV=production
    bun run build

    # Step 4: Restart server
    log "Step 4/5: Restarting server..."
    if command -v pm2 &>/dev/null; then
      pm2 restart sanad 2>/dev/null || pm2 start ecosystem.config.cjs --env production
      pm2 save
      log "PM2 started. Auto-start on boot: pm2 startup"
    else
      pkill -f "standalone/server.js" 2>/dev/null || true
      sleep 2
      NODE_ENV=production nohup bun .next/standalone/server.js > logs/sanad-out.log 2>&1 &
      log "Server started (PID: $!). Install PM2 for production: npm install -g pm2"
    fi

    # Step 5: Health check
    log "Step 5/5: Health check..."
    sleep 4
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
      log "=== Deploy successful! ==="
      log "Sanad is live at: http://localhost:3000"
      log "Logs: ./deploy.sh logs"
      log "Status: ./deploy.sh status"
    else
      err "Health check failed. Check logs: ./deploy.sh logs"
      exit 1
    fi
    ;;

  *)
    echo "Usage: $0 {build|restart|stop|logs|status|deploy}"
    exit 1
    ;;
esac
