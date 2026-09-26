import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringhistorialestadoDao from "#root/src/daos/factoringhistorialestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GetFactoringhistorialestadosByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Consulta el historial de estados de una operación de factoring para el perfil financiero.
 */
export const getFactoringhistorialestadosByFactoringidService = async (
  dto: GetFactoringhistorialestadosByFactoringidDto,
) => {
  log.debug(line(), "service::financiero::getFactoringhistorialestadosByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de catálogos maestros para el historial de estados de factoring.
 */
export const getFactoringhistorialestadoMasterService = async () => {
  log.debug(line(), "service::financiero::getFactoringhistorialestadoMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);

      return {
        factoringestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general del historial de estados de factoring.
 */
export const getFactoringhistorialestadosService = async () => {
  log.debug(line(), "service::financiero::getFactoringhistorialestadosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringhistorialestadoDao.getFactoringhistorialestados(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
