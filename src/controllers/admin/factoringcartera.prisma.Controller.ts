import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringcarteraDao from "#src/daos/factoringcartera.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#root/src/utils/logger.pino.js";

export const getFactoringcarteraResumen = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringcarteraResumen");
  const resumen = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await factoringcarteraDao.getFactoringcarteraResumen(tx);
      
      // Prisma raw queries might return BigInts for COUNT() or SUM() which break JSON.stringify
      if (result && Array.isArray(result)) {
        return result.map(row => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key] = typeof row[key] === 'bigint' ? row[key].toString() : row[key];
          }
          return newRow;
        });
      }
      
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, resumen);
};
