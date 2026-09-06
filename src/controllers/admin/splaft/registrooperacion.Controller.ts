import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { Request, Response } from "express";

export const getSplaftRegistroOperaciones = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSplaftRegistroOperaciones");
  const registros = await prismaFT.client.$transaction(
    async (tx) => {
      const configMontoMinimo = await configuracionappDao.getSplaftRegistroOperacionesMontoMinimo(tx);
      const montoMinimo = configMontoMinimo?.valor && !isNaN(Number(configMontoMinimo.valor)) ? Number(configMontoMinimo.valor) : 10000;
      const result = await factoringDao.getSplaftRegistroOperaciones(tx, montoMinimo);

      if (result && Array.isArray(result)) {
        return result.map((row) => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key] = typeof row[key] === "bigint" ? row[key].toString() : row[key];
          }
          return newRow;
        });
      }

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, registros);
};
