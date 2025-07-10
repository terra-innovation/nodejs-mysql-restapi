import { Request, Response, NextFunction } from "express";
import ipRangeCheck from "ip-range-check";
import { whitelist, blacklist, isWhitelistAll, isBlacklistAll } from "#src/utils/ipAccessControl.js";
import { log, line } from "#src/utils/logger.pino.js";

export const ipFilterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const ip = rawIp.replace(/^::ffff:/, "");

  if (!whitelist || !blacklist) {
    log.warn(line(), "Acceso denegado: listas IP no disponibles", { ip });
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  if (isBlacklistAll()) {
    log.warn(line(), "Acceso denegado: blacklist global (*)", { ip });
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  if (ipRangeCheck(ip, blacklist)) {
    log.warn(line(), "Acceso denegado: IP en blacklist", { ip });
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  if (isWhitelistAll()) {
    return next();
  }

  if (whitelist.length === 0) {
    log.warn(line(), "Acceso denegado: whitelist vacia", { ip });
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  if (!ipRangeCheck(ip, whitelist)) {
    log.warn(line(), "Acceso denegado: IP no autorizada", { ip });
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  next();
};
