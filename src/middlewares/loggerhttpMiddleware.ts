// src/middlewares/httpLogger.ts
import pinoHttp from "pino-http";
import { loggerInstance } from "#src/utils/logger.pino.js";

export const httpLogger = pinoHttp({
  logger: loggerInstance,
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        remoteAddress: req.socket?.remoteAddress || null,
        remotePort: req.socket?.remotePort || null,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ➜ ${res.statusCode}`;
  },
  customErrorMessage(req, res, err) {
    return `Request errored: ${req.method} ${req.url} ➜ ${res.statusCode} - ${err.message}`;
  },
  autoLogging: {
    ignore(req) {
      return ["/health", "/favicon.ico"].includes(req.url ?? "");
    },
  },
});
