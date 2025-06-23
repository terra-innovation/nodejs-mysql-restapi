module.exports = {
  apps: [
    {
      name: "ft-api-backend",
      script: "dist/index.js",
      instances: 1, // puedes cambiar a 'max' para cluster mode
      autorestart: true,
      watch: false, // desactiva watch en producción
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
