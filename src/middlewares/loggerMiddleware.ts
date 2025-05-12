// src/middlewares/httpLogger.ts
import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { AsyncLocalStorage } from "node:async_hooks";
import { loggerInstance } from "#src/utils/logger.pino.js";
import { Request, Response, NextFunction } from "express";
import { initContext } from "#src/utils/context/loggerContext.js";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  httpLogger(req, res);
  req.correlationId = String(req.id);
  res.set("X-Correlation-Id", String(req.id));

  initContext({ correlationId: req.correlationId }, () => next());
};

export const httpLogger = pinoHttp({
  logger: loggerInstance,
  genReqId: (req: Request) => req.get("X-Correlation-Id") || uuidv4(),
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.raw?.ip || null,
        host: req.raw.hostname || null,
        userAgent: req.raw.get("user-agent"),
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
