import * as administracionbdDao from "#root/src/daos/administracion/administracionbd.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── Services ────────────────────────────────────────────────────────────────

export const getTimezonesService = async () => {
  log.debug(line(), "service::getTimezonesService");

  const now = new Date();

  const serverDateInfo = {
    now: now,
    iso: now.toISOString(),
    utc: now.toUTCString(),
    locale: now.toLocaleString(),
    localeDate: now.toLocaleDateString(),
    localeTime: now.toLocaleTimeString(),
    epochMillis: now.getTime(),
    epochSeconds: Math.floor(now.getTime() / 1000),
    timezoneOffsetMinutes: now.getTimezoneOffset(),
    timezoneOffsetHours: -now.getTimezoneOffset() / 60,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    runtimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    envTimezone: process.env.TZ || null,
    highResTime: process.hrtime(),
    uptimeSeconds: process.uptime(),
  };

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await administracionbdDao.getTimezones(tx);
      log.debug(line(), "result", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return {
    serverDateInfo,
    bbddDateInfo: { ...resultado[0] },
  };
};
