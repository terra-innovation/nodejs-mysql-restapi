import { Request, Response, NextFunction } from "express";
import ipRangeCheck from "ip-range-check";
import { whitelist, blacklist, isWhitelistAll, isBlacklistAll } from "#src/utils/ipAccessControl.js";
import { log, line } from "#src/utils/logger.pino.js";

export const ipFilterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const rawIp = req.ip || req.socket?.remoteAddress || "anonymous";
  const ip = rawIp.replace(/^::ffff:/, "");

  const dataTrazabilidad = {
    id: req.id,
    method: req.method,
    url: req.url,
    ip: rawIp,
    host: req.hostname || "anonymous",
    userAgent: req.get("user-agent") || "anonymous",
  };

  if (!whitelist || !blacklist) {
    log.warn(line(), "Acceso denegado: listas IP no disponibles", dataTrazabilidad);
    res.status(403).json({ error: true, message: "Acceso denegado" });
    return;
  }

  if (isBlacklistAll()) {
    log.warn(line(), "Acceso denegado: blacklist global (*)", dataTrazabilidad);
    res.status(403).json({ error: true, message: "Acceso denegado" });
    return;
  }

  if (ipRangeCheck(ip, blacklist)) {
    log.warn(line(), "Acceso denegado: IP en blacklist", dataTrazabilidad);
    res.status(403).json({ error: true, message: "Acceso denegado" });
    return;
  }

  if (isWhitelistAll()) {
    return next();
  }

  if (whitelist.length === 0) {
    log.warn(line(), "Acceso denegado: whitelist vacia", dataTrazabilidad);
    res.status(403).json({ error: true, message: "Acceso denegado" });
    return;
  }

  if (!ipRangeCheck(ip, whitelist)) {
    log.warn(line(), "Acceso denegado: IP no autorizada", dataTrazabilidad);
    res.status(403).json({ error: true, message: "Acceso denegado" });
    return;
  }

  next();
};
