import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringsService = async (_session_idusuario?: number) => {
  log.debug(line(), "service::getFactoringsService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const _idfactoringestados = [5];
      const factorings = await factoringDao.getFactoringsOportunidades(tx, _idfactoringestados, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringMasterService = async () => {
  log.debug(line(), "service::getFactoringMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
