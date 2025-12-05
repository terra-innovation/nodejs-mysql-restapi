import { log, line } from "#src/utils/logger.pino.js";
import { isProduction, isDevelopment, isTest } from "#src/config.js";

import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiterGlobal = new RateLimiterMemory({
  points: isProduction ? 500 : isDevelopment ? 2000 : isTest ? 2000 : 10, // 100 solicitudes
  duration: 10 * 60, //En 10 minutos
  insuranceLimiter: new RateLimiterMemory({ points: 50, duration: 10 * 60 }),
});

export const rateLimiterGlobalMiddleware = async (req, res, next) => {
  try {
    const rlRes = await rateLimiterGlobal.consume(req.ip);
    next();
  } catch (err) {
    const minutesLeft = (err.msBeforeNext / 1000 / 60).toFixed(2);
    log.warn(line(), `Rate limit global excedido para IP`, { ip: req.ip, minutesLeft });
    res.status(429).json({ error: true, message: `Demasiadas solicitudes. Intenta nuevamente en ${minutesLeft} minutos.` });
  }
};

const rateLimiterLogin = new RateLimiterMemory({
  points: isProduction ? 10 : isDevelopment ? 200 : isTest ? 200 : 10, // 5 solicitudes
  duration: 10 * 60, //En 10 minutos
  insuranceLimiter: new RateLimiterMemory({ points: 2, duration: 10 * 60 }),
});

export const rateLimiterLoginMiddleware = async (req, res, next) => {
  try {
    const rlRes = await rateLimiterLogin.consume(req.ip);
    next();
  } catch (err) {
    const minutesLeft = (err.msBeforeNext / 1000 / 60).toFixed(2);
    log.warn(line(), `Rate limit excedido para IP`, { ip: req.ip, minutesLeft });
    res.status(429).json({ error: true, message: `Demasiadas solicitudes. Intenta nuevamente en ${minutesLeft} minutos.` });
  }
};
