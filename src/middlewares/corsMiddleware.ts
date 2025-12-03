import cors from "cors";
import { log, line } from "#src/utils/logger.pino.js";
import { isProduction, isDevelopment, isTest } from "#src/config.js";

function getAllowedOrigins(): string[] | "*" {
  if (isProduction) return CORS_ORIGINS.production;
  if (isDevelopment) return CORS_ORIGINS.development;
  if (isTest) return CORS_ORIGINS.test;
  return "*"; // fallback defensivo
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Permitir undefined solo en desarrollo
    if (!origin && isDevelopment) {
      return callback(null, true);
    }

    if (allowedOrigins === "*") {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    log.warn(line(), `CORS blocked request from origin: ${origin}`);

    return callback(new Error(`CORS: Origin no permitido (${origin})`));
  },
  exposedHeaders: ["Content-Disposition"],
});

const CORS_ORIGINS = {
  production: ["https://app.finanzatech.com", "https://app.finanzatech.com"],
  development: ["http://localhost:3000", "http://127.0.0.1:3000"],
  test: [],
};
