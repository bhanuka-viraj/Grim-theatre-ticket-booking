module.exports = {
  apps: [
    {
      name: "ticket-booking-backend",
      script: "./backend/server.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      watch: false,
    },
  ],
};
