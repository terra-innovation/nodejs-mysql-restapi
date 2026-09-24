import * as factoringcarteraDao from "#root/src/daos/factoringcartera.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";

// ─── Services ────────────────────────────────────────────────────────────────

export const getFactoringcarteraResumenService = async () => {
  log.debug(line(), "service::getFactoringcarteraResumenService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const result = await factoringcarteraDao.getFactoringcarteraResumen(tx);

      // Prisma raw queries might return BigInts for COUNT() or SUM() which break JSON.stringify
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
