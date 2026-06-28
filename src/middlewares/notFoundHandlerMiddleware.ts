import { isProduction } from "#src/config.js";
import * as telegramService from "#src/services/telegram.Service.js";
import { NextFunction, Request, Response } from "express";

export function notFoundHandlerMiddleware(req: Request, res: Response, next: NextFunction) {
  const notfound = {
    error: true,
    message: "Not found",
    path: req.originalUrl,
    method: req.method,
  };

  if (!isProduction) {
    telegramService.sendMessageError(notfound);
  }

  res.status(404).json(notfound);
}
