import * as archivofacturaDao from "#root/src/daos/archivofactura.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GetArchivofacturasByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getArchivofacturasByFactoringidService = async (dto: GetArchivofacturasByFactoringidDto) => {
  log.debug(line(), "service::getArchivofacturasByFactoringidService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivofacturas = await archivofacturaDao.getArchivofacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);
      return archivofacturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
