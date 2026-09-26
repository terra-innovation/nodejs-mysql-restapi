import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#root/src/daos/factoringpropuestahistorialestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UpdateFactoringpropuestahistorialestadoDto {
  factoringpropuestahistorialestadoid: string;
  comentario: string;
}

export interface CreateFactoringpropuestahistorialestadoDto {
  factoringpropuestaid: string;
  factoringpropuestaestadoid: string;
  comentario: string;
}

export interface GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto {
  factoringpropuestaid: string;
}

export interface FactoringpropuestahistorialestadoIdDto {
  factoringpropuestahistorialestadoid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Actualiza el comentario de un registro de historial de estado de propuesta.
 */
export const updateFactoringpropuestahistorialestadoService = async (
  dto: UpdateFactoringpropuestahistorialestadoDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::updateFactoringpropuestahistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuestahistorialestado =
        await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(
          tx,
          dto.factoringpropuestahistorialestadoid,
        );
      if (!factoringpropuestahistorialestado) {
        log.warn(
          line(),
          `Factoringpropuestahistorialestado no existe: [${dto.factoringpropuestahistorialestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoToUpdate: Prisma.factoring_propuesta_historial_estadoUpdateInput = {
        comentario: dto.comentario,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestahistorialestadoUpdated =
        await factoringpropuestahistorialestadoDao.updateFactoringpropuestahistorialestado(
          tx,
          dto.factoringpropuestahistorialestadoid,
          factoringpropuestahistorialestadoToUpdate,
        );
      log.debug(line(), "factoringpropuestahistorialestadoUpdated:", factoringpropuestahistorialestadoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta los historiales de estado asociados a una propuesta de factoring.
 */
export const getFactoringpropuestahistorialestadosByFactoringpropuestaidService = async (
  dto: GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto,
) => {
  log.debug(line(), "service::admin::getFactoringpropuestahistorialestadosByFactoringpropuestaidService");

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
 * Consulta catálogos maestros para el historial de estados de propuesta de factoring.
 */
export const getFactoringpropuestahistorialestadoMasterService = async () => {
  log.debug(line(), "service::admin::getFactoringpropuestahistorialestadoMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringpropuestaestados =
        await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      return {
        factoringpropuestaestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Registra un nuevo estado en el historial de la propuesta y actualiza la propuesta.
 */
export const createFactoringpropuestahistorialestadoService = async (
  dto: CreateFactoringpropuestahistorialestadoDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::createFactoringpropuestahistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
        tx,
        dto.factoringpropuestaid,
      );
      if (!factoringpropuesta) {
        log.warn(line(), `Factoringpropuesta no existe: [${dto.factoringpropuestaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestaestado =
        await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(
          tx,
          dto.factoringpropuestaestadoid,
        );
      if (!factoringpropuestaestado) {
        log.warn(line(), `Factoringpropuesta estado no existe: [${dto.factoringpropuestaestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        usuario_modifica: { connect: { idusuario } },
        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: dto.comentario,
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated =
        await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(
          tx,
          factoringpropuestahistorialestadoToCreate,
        );
      log.debug(
        line(),
        "factoringpropuestahistorialestadoCreated:",
        factoringpropuestahistorialestadoCreated,
      );

      const factoringpropuestaToUpdate: Prisma.factoring_propuestaUpdateInput = {
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(
        tx,
        dto.factoringpropuestaid,
        factoringpropuestaToUpdate,
      );
      log.debug(line(), "factoringpropuestaUpdated:", factoringpropuestaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa un registro del historial de propuestas de factoring.
 */
export const activateFactoringpropuestahistorialestadoService = async (
  dto: FactoringpropuestahistorialestadoIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::activateFactoringpropuestahistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuestahistorialestado =
        await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(
          tx,
          dto.factoringpropuestahistorialestadoid,
        );
      if (!factoringpropuestahistorialestado) {
        log.warn(
          line(),
          `Factoringpropuestahistorialestado no existe: [${dto.factoringpropuestahistorialestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoActivated =
        await factoringpropuestahistorialestadoDao.activateFactoringpropuestahistorialestado(
          tx,
          dto.factoringpropuestahistorialestadoid,
          idusuario,
        );
      log.debug(
        line(),
        "factoringpropuestahistorialestadoActivated:",
        factoringpropuestahistorialestadoActivated,
      );

      return factoringpropuestahistorialestadoActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente un registro del historial de propuestas de factoring.
 */
export const deleteFactoringpropuestahistorialestadoService = async (
  dto: FactoringpropuestahistorialestadoIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::deleteFactoringpropuestahistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuestahistorialestado =
        await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(
          tx,
          dto.factoringpropuestahistorialestadoid,
        );
      if (!factoringpropuestahistorialestado) {
        log.warn(
          line(),
          `Factoringpropuestahistorialestado no existe: [${dto.factoringpropuestahistorialestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoDeleted =
        await factoringpropuestahistorialestadoDao.deleteFactoringpropuestahistorialestado(
          tx,
          dto.factoringpropuestahistorialestadoid,
          idusuario,
        );
      log.debug(
        line(),
        "factoringpropuestahistorialestadoDeleted:",
        factoringpropuestahistorialestadoDeleted,
      );

      return factoringpropuestahistorialestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general de historiales de estados de propuestas para admin.
 */
export const getFactoringpropuestahistorialestadosService = async () => {
  log.debug(line(), "service::admin::getFactoringpropuestahistorialestadosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestados(
        tx,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
