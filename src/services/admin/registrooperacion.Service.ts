import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";

export const getSplaftRegistroOperacionesService = async () => {
  log.debug(line(), "service::getSplaftRegistroOperacionesService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const configMontoMinimo = await configuracionappDao.getSplaftRegistroOperacionesMontoMinimo(tx);
      const montoMinimo =
        configMontoMinimo?.valor && !isNaN(Number(configMontoMinimo.valor))
          ? Number(configMontoMinimo.valor)
          : 10000;

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
};
