module.exports = {
  apps: [
    {
      name: 'sanad-web',
      script: '.next/standalone/server.js',
      instances: 'max', // Utilizes all available CPU cores
      exec_mode: 'cluster', // Enables cluster mode for zero-downtime reloads
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      }
    }
  ]
};
