module.exports = {
  apps: [{
    name: 'smart-workplace-os',
    script: 'server.js',
    cwd: '.',
    instances: process.env.NODE_ENV === 'production' ? 2 : 1,
    exec_mode: 'cluster',
    watch: process.env.NODE_ENV !== 'production',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }],
};
