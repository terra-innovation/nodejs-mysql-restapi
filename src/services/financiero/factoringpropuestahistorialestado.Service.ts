import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#root/src/daos/factoringpropuestahistorialestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto {
  factoringpropuestaid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Consulta el historial de estados de una propuesta de factoring para el perfil financiero.
 */
export const getFactoringpropuestahistorialestadosByFactoringpropuestaidService = async (
  dto: GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto,
) => {
  log.debug(line(), "service::financiero::getFactoringpropuestahistorialestadosByFactoringpropuestaidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
        tx,
        dto.factoringpropuestaid,
      );
      if (!factoringpropuesta) {
        log.warn(line(), `Factoringpropuesta no existe: [${dto.factoringpropuestaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadosByIdfactoringpropuesta(
        tx,
        factoringpropuesta.idfactoringpropuesta,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de catálogos maestros para el historial de estados de propuestas de factoring.
 */
export const getFactoringpropuestahistorialestadoMasterService = async () => {
  log.debug(line(), "service::financiero::getFactoringpropuestahistorialestadoMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(
        tx,
        filter_estados,
      );

      return {
        factoringpropuestaestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general del historial de estados de propuestas de factoring.
 */
export const getFactoringpropuestahistorialestadosService = async () => {
  log.debug(line(), "service::financiero::getFactoringpropuestahistorialestadosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestados(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
