import * as administracionbdDao from "#root/src/daos/administracion/administracionbd.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Request, Response } from "express";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import * as yup from "yup";

export const getTimezones = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateTransaction");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
  const usuariopedidoCreateSchema = yup.object().shape({}).required();
  var usuariopedidoValidated = usuariopedidoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", usuariopedidoValidated);
  const now = new Date();

  const serverDateInfo = {
    now: now,
    iso: now.toISOString(), // Fecha en formato ISO 8601 (UTC)
    utc: now.toUTCString(), // UTC como string legible
    locale: now.toLocaleString(), // Según configuración regional del servidor
    localeDate: now.toLocaleDateString(),
    localeTime: now.toLocaleTimeString(),

    epochMillis: now.getTime(), // Timestamp en milisegundos desde 1970
    epochSeconds: Math.floor(now.getTime() / 1000),

    timezoneOffsetMinutes: now.getTimezoneOffset(), // Diferencia con UTC en minutos (negativo si está adelante)
    timezoneOffsetHours: -now.getTimezoneOffset() / 60, // Diferencia en horas

    year: now.getFullYear(),
    month: now.getMonth() + 1, // 0-indexed en JS
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),

    runtimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Zona horaria configurada en Node
    envTimezone: process.env.TZ || null, // Variable de entorno TZ si está definida

    highResTime: process.hrtime(), // Alta resolución para medición de rendimiento
    uptimeSeconds: process.uptime(), // Tiempo que lleva corriendo el proceso Node
  };

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await administracionbdDao.getTimezones(tx);
      log.debug(line(), "result", result);

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, { serverDateInfo: serverDateInfo, bbddDateInfo: { ...resultado[0] } });
};
