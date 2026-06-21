// PM2 Ecosystem — Sanad Legal Dashboard
// Suitable for home server deployment (192GB RAM)
//
// Usage:
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save
//   pm2 startup  # to auto-start on boot
//   pm2 logs sanad  # view logs
//   pm2 restart sanad  # restart after updates
//   pm2 stop sanad  # stop

module.exports = {
  apps: [
    {
      name: 'sanad',
      script: '.next/standalone/server.js',
      cwd: '/home/z/my-project',
      instances: 1, // Single instance — SQLite doesn't support concurrent writers
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: 1,
        DATABASE_URL: 'file:/home/z/my-project/db/custom.db',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Logging
      error_file: '/home/z/my-project/logs/sanad-error.log',
      out_file: '/home/z/my-project/logs/sanad-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Watch (disabled in prod — restart manually after deploys)
      watch: false,
    },
  ],
}
