import { log, line } from "#src/utils/logger.pino.js";
import { isProduction, isDevelopment, isTest } from "#src/config.js";

export const blockSuspiciousUAMiddleware = async (req, res, next) => {
  const ua = req.headers["user-agent"]?.toLowerCase() || "";

  // Lista configurable de User-Agents bloqueados
  const blockedAgents = ["curl", "wget", "python", "scrapy", "httpclient", "java", "libwww"];

  if (blockedAgents.some((agent) => ua.includes(agent))) {
    log.warn(line(), "User-Agent no permitido", { useragent: ua });
    if (isProduction) {
      return res.status(404).end();
    } else {
      return res.status(404).json({
        error: true,
        message: "User-Agent no permitido",
      });
    }
  }
  next();
};
