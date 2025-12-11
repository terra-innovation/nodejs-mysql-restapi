module.exports = {
  apps: [
    {
      name: "ft-api-backend",
      script: "dist/index.js",
      instances: 1, // puedes cambiar a 'max' para cluster mode
      autorestart: true,
      max_restarts: 3,
      watch: false, // desactiva watch en producción
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      //log_file: "logs/pm2/ft-api-backend-combined.log", // Opcional: Unifica stdout y stderr en un solo archivo
      out_file: "logs/pm2/ft-api-backend-stdout.log", // Archivo para logs de salida de console. (info, debug, trace)
      error_file: "logs/pm2/ft-api-backend-stderr.log", // Archivo para logs de error de console. (warn, error, fatal)
      merge_logs: true, // Útil si usas múltiples instancias
      log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",
    },
  ],
};
