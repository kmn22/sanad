# سند (Sanad) — Production Deployment Guide

لوحة العمليات اليومية للمحامين وطلاب القانون في السعودية.

Daily operations dashboard for Saudi lawyers and law students.

---

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <your-repo-url> sanad
cd sanad
bun install

# 2. Set up database
cp .env.example .env
bun run db:push

# 3. Seed demo data (optional)
bun run seed

# 4. Build for production
./deploy.sh build

# 5. Start server
./deploy.sh restart
```

Sanad is now live at `http://localhost:3000`

---

## System Requirements

- **OS**: Linux (Ubuntu 22.04+ recommended), macOS, or Windows
- **RAM**: 512MB minimum, 2GB recommended (your 192GB home server is massive overkill)
- **Disk**: 500MB for app + database
- **Node.js**: 18+ (or Bun 1+)
- **Database**: SQLite (default, no setup needed) or PostgreSQL (for multi-user)

---

## Production Deployment Options

### Option A: Direct Bun (simplest, single process)

```bash
./deploy.sh deploy
```

Server runs as a background process. Logs go to `logs/sanad-out.log`.

**Pros**: Simple, no extra dependencies.
**Cons**: No auto-restart on crash, no log rotation, no clustering.

### Option B: PM2 (recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config
pm2 start ecosystem.config.cjs --env production

# Auto-start on server boot
pm2 startup
pm2 save

# Useful commands:
pm2 logs sanad         # view logs
pm2 restart sanad      # restart
pm2 monit              # live monitor
pm2 status             # check status
```

**Pros**: Auto-restart, log management, clustering, monitoring.
**Cons**: Extra dependency.

### Option C: Systemd (for dedicated servers)

Create `/etc/systemd/system/sanad.service`:

```ini
[Unit]
Description=Sanad Legal Dashboard
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/sanad
ExecStart=/usr/bin/bun /home/your-username/sanad/.next/standalone/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=file:/home/your-username/sanad/db/custom.db

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable sanad
sudo systemctl start sanad
sudo systemctl status sanad
```

---

## HTTPS / SSL Setup

### Using Caddy (recommended — auto-HTTPS)

Caddy is already configured in `Caddyfile`. To expose Sanad publicly with HTTPS:

1. Point your domain (e.g., `sanad.yourdomain.com`) to your server's IP
2. Edit `Caddyfile` to use your domain:

```caddy
sanad.yourdomain.com {
    reverse_proxy localhost:3000
}
```

3. Restart Caddy:

```bash
sudo systemctl restart caddy
```

Caddy automatically provisions Let's Encrypt SSL certificates.

### Using Nginx + Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/sanad`:

```nginx
server {
    server_name sanad.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sanad /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d sanad.yourdomain.com
```

---

## Database

### SQLite (default — perfect for home server)

- Zero configuration
- Stored in `db/custom.db`
- Backup: just copy the file
- Suitable for up to ~100 concurrent users

**Backup script**:

```bash
# Add to crontab for daily backups
0 2 * * * cp /home/z/my-project/db/custom.db /home/z/backups/sanad-$(date +\%Y\%m\%d).db
```

### PostgreSQL (for multi-user / enterprise)

1. Install PostgreSQL:

```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser sanad --pwprompt
sudo -u postgres createdb sanad -O sanad
```

2. Update `.env`:

```env
DATABASE_URL="postgresql://sanad:yourpassword@localhost:5432/sanad?schema=public"
```

3. Migrate:

```bash
bun run db:push
bun run seed
```

---

## Home Server Optimization (192GB RAM)

Your home server has massive RAM — here's how to leverage it:

### 1. Increase Node.js memory limit

```bash
# In ecosystem.config.cjs, add:
node_args: '--max-old-space-size=4096'  // 4GB heap
```

### 2. Run multiple instances (if using PostgreSQL)

```javascript
// ecosystem.config.cjs
instances: 4,  // 4 worker processes
exec_mode: 'cluster',
```

**Note**: SQLite doesn't support cluster mode — keep `instances: 1` with SQLite.

### 3. Enable Brotli compression (Caddy does this automatically)

Already configured in Caddyfile.

### 4. Database backups

```bash
# Add to crontab — backup every 6 hours
0 */6 * * * /home/z/my-project/scripts/backup-db.sh
```

---

## PWA (Progressive Web App)

Sanad is a PWA — users can install it on desktop/mobile.

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Install**: Visit the site in Chrome/Edge → click install icon in address bar
- **Offline**: App shell cached, works offline for read operations

---

## Updating Sanad

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./deploy.sh deploy
```

Zero-downtime deploy with PM2:

```bash
pm2 reload sanad
```

---

## Monitoring

### Health check endpoint

```bash
curl http://localhost:3000/api/dashboard
# Returns 200 + JSON = healthy
```

### Logs

```bash
./deploy.sh logs                    # live logs
tail -f logs/sanad-out.log          # direct file
pm2 logs sanad --lines 100          # PM2 last 100 lines
```

### PM2 monitoring

```bash
pm2 monit                           # live CPU/Memory monitor
pm2 status                          # process status
```

---

## Security Checklist

- [x] HTTPS enforced (via Caddy/Nginx)
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] No `powered-by` header
- [x] Strict Transport Security (HSTS)
- [x] Service worker scope restricted
- [x] No query logging in production
- [ ] **Add authentication** (NextAuth.js is installed but not configured — see below)
- [ ] **Set up firewall** (ufw allow 80,443 only)
- [ ] **Enable fail2ban** for SSH protection
- [ ] **Regular database backups**

### Adding Authentication (recommended)

Sanad has `next-auth` installed. To enable:

1. Set environment variables:

```env
NEXTAUTH_URL=https://sanad.yourdomain.com
NEXTAUTH_SECRET=your-random-secret-here  # generate with: openssl rand -base64 32
```

2. Configure auth provider in `src/app/api/auth/[...nextauth]/route.ts`

3. Wrap protected routes with middleware

---

## Troubleshooting

### Build fails with TypeScript errors

```bash
bun run typecheck  # see all errors
```

### Database connection issues

```bash
# Check database file exists
ls -la db/custom.db

# Reset database (WARNING: deletes all data)
bun run db:reset
bun run seed
```

### Port 3000 already in use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Service worker not updating

Browsers cache service workers aggressively. To force update:

1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Refresh page

Or bump the cache version in `public/sw.js`:

```javascript
const CACHE_VERSION = 'sanad-v2'  // increment this
```

---

## File Structure

```
sanad/
├── .next/standalone/        # Production build output
├── db/custom.db             # SQLite database
├── public/                  # Static assets (manifest, sw.js, icons)
├── prisma/schema.prisma     # Database schema
├── scripts/                 # Seed scripts
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (35 endpoints)
│   │   ├── page.tsx         # Main page (single route)
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── sanad/           # Sanad feature components (15 views)
│   └── lib/
│       ├── db.ts            # Prisma client
│       └── sanad/           # Types + i18n
├── ecosystem.config.cjs     # PM2 config
├── deploy.sh                # Deployment script
├── Caddyfile                # Reverse proxy config
└── .env                     # Environment variables
```

---

## License

Private project. All rights reserved.
