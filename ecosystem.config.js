module.exports = {
  apps: [
    {
      name: 'sanad-web',
      script: '.next/standalone/server.js',
      instances: 1, // SQLite single-instance only
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      }
    }
  ]
};
