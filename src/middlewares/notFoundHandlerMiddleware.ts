import { Request, Response, NextFunction } from "express";

export function notFoundHandlerMiddleware(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    error: true,
    message: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
}
