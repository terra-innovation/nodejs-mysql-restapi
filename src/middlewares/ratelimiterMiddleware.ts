import { log, line } from "#src/utils/logger.pino.js";
import { isProduction, isDevelopment, isTest } from "#src/config.js";

import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiterGlobal = new RateLimiterMemory({
  points: isProduction ? 100 : isDevelopment ? 2000 : isTest ? 2000 : 10, // 100 solicitudes
  duration: 10 * 60, //En 10 minutos
  insuranceLimiter: new RateLimiterMemory({ points: 50, duration: 10 * 60 }),
});

export const rateLimiterGlobalMiddleware = async (req, res, next) => {
  try {
    await rateLimiterGlobal.consume(req.ip);
    next();
  } catch {
    log.warn(line(), `Rate limit global excedido para IP`, { ip: req.ip });
    res.status(429).json({ error: true, message: "Demasiadas solicitudes. Intenta más tarde." });
  }
};

const rateLimiterLogin = new RateLimiterMemory({
  points: isProduction ? 5 : isDevelopment ? 200 : isTest ? 200 : 10, // 5 solicitudes
  duration: 10 * 60, //En 10 minutos
  insuranceLimiter: new RateLimiterMemory({ points: 2, duration: 10 * 60 }),
});

export const rateLimiterLoginMiddleware = async (req, res, next) => {
  try {
    await rateLimiterLogin.consume(req.ip);
    next();
  } catch {
    log.warn(line(), `Rate limit excedido para IP`, { ip: req.ip });
    res.status(429).json({ error: true, message: "Demasiadas solicitudes. Intenta más tarde." });
  }
};
