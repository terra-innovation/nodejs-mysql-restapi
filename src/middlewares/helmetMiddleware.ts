import cors from "cors";
import { log, line } from "#src/utils/logger.pino.js";
import { isProduction, isDevelopment, isTest } from "#src/config.js";

import helmet from "helmet";

/**
 * Middleware avanzado para seguridad HTTP usando Helmet.
 * Incluye configuraciones recomendadas para producción.
 */
export const helmetMiddleware = helmet({
  // Activa la mayoría de protecciones por defecto
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" }, // Evita clickjacking
  hidePoweredBy: true, // Oculta cabecera X-Powered-By
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true, // Evita MIME sniffing
  originAgentCluster: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true, // Protección básica contra XSS
});
