// PM2 Ecosystem — Sanad Legal Dashboard
//
// Usage:
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save
//   pm2 startup
//   pm2 logs sanad
//   pm2 restart sanad
//   pm2 stop sanad

const path = require('path')
const PROJECT_DIR = __dirname

module.exports = {
  apps: [
    {
      name: 'sanad',
      script: '.next/standalone/server.js',
      cwd: PROJECT_DIR,
      instances: 1, // SQLite — single instance only
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        NEXT_TELEMETRY_DISABLED: 1,
        DATABASE_URL: `file:${path.join(PROJECT_DIR, 'db/custom.db')}`,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: path.join(PROJECT_DIR, 'logs/sanad-error.log'),
      out_file: path.join(PROJECT_DIR, 'logs/sanad-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      watch: false,
    },
  ],
}
