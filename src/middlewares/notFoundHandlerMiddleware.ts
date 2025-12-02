import { Request, Response, NextFunction } from "express";
import * as telegramService from "#src/services/telegram.Service.js";

export function notFoundHandlerMiddleware(req: Request, res: Response, next: NextFunction) {
  const notfound = {
    error: true,
    message: "Not found",
    path: req.originalUrl,
    method: req.method,
  };
  telegramService.sendMessageTelegramEndPointNotFound(notfound);
  res.status(404).json(notfound);
}
