import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface OperacionFactoringDto {
  factoringid: string;
  idusuario: number;
}

export interface UpdateFactoringDto {
  factoringid: string;
  factoringpropuestaaceptadaid?: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Activa lógicamente una operación de factoring en el módulo administrativo.
 */
export const activateFactoringService = async (dto: OperacionFactoringDto) => {
  log.debug(line(), "service::admin::activateFactoringService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringActivated = await factoringDao.activateFactoring(tx, dto.factoringid, dto.idusuario);
      if (factoringActivated[0] === 0) {
        throw new ClientError("Factoring no existe", 404);
      }
      log.debug(line(), "factoringActivated:", factoringActivated);
      return factoringActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una operación de factoring en el módulo administrativo.
 */
export const deleteFactoringService = async (dto: OperacionFactoringDto) => {
  log.debug(line(), "service::admin::deleteFactoringService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringDeleted = await factoringDao.deleteFactoring(tx, dto.factoringid, dto.idusuario);
      if (factoringDeleted[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringDeleted:", factoringDeleted);
      return factoringDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza la propuesta aceptada vinculada a una operación de factoring.
 */
export const updateFactoringService = async (dto: UpdateFactoringDto) => {
  log.debug(line(), "service::admin::updateFactoringService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      let factoringpropuesta: any = null;
      if (dto.factoringpropuestaaceptadaid) {
        factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
          tx,
          dto.factoringpropuestaaceptadaid,
        );
        if (!factoringpropuesta) {
          log.warn(line(), `factoring propuesta no existe: [${dto.factoringpropuestaaceptadaid}]`);
          throw new ClientError("Datos no válidos", 404);
        }
      }

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_propuesta_aceptada: dto.factoringpropuestaaceptadaid
          ? {
              connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta },
            }
          : { disconnect: true },
        idusuariomod: dto.idusuario,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoring.factoringid, factoringToUpdate);
      log.debug(line(), "factoringUpdated", factoringUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de catálogos maestros para administración de operaciones de factoring.
 */
export const getFactoringMasterService = async () => {
  log.debug(line(), "service::admin::getFactoringMasterService");
  const filter_estados = [ESTADO.ACTIVO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);

      return {
        factoringtipos,
        factoringestados,
        riesgos,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de operaciones de factoring para el panel administrativo.
 */
export const getFactoringsService = async () => {
  log.debug(line(), "service::admin::getFactoringsService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      return await factoringDao.getFactoringsByEstados(tx, filter_estados);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
