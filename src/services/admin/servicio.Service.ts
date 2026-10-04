import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as servicioDao from "#root/src/daos/servicio.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ActivateServicioDto {
  servicioid: string;
  idusuario: number;
}

export interface DeleteServicioDto {
  servicioid: string;
  idusuario: number;
}

export interface UpdateServicioDto {
  servicioid: string;
  nombre: string;
  alias: string;
  descripcion?: string;
  urlcontrato?: string;
  pathroute?: string;
  idusuario: number;
}

export interface CreateServicioDto {
  nombre: string;
  alias: string;
  descripcion: string;
  urlcontrato: string;
  pathroute: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const activateServicioService = async (dto: ActivateServicioDto) => {
  log.debug(line(), "service::activateServicioService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const servicioActivated = await servicioDao.activateServicio(tx, dto.servicioid, dto.idusuario);
      log.debug(line(), "servicioActivated:", servicioActivated);
      return servicioActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteServicioService = async (dto: DeleteServicioDto) => {
  log.debug(line(), "service::deleteServicioService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const servicioDeleted = await servicioDao.deleteServicio(tx, dto.servicioid, dto.idusuario);
      if (servicioDeleted[0] === 0) {
        throw new ClientError("Servicio no existe", 404);
      }
      log.debug(line(), "servicioDeleted:", servicioDeleted);
      return servicioDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getServicioMasterService = async () => {
  log.debug(line(), "service::getServicioMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const serviciosMaster: Record<string, any> = {};
      return serviciosMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateServicioService = async (dto: UpdateServicioDto) => {
  log.debug(line(), "service::updateServicioService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const servicio = await servicioDao.getServicioByServicioid(tx, dto.servicioid);
      if (!servicio) {
        log.warn(line(), "Servicio no existe: [" + dto.servicioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioToUpdate: Prisma.servicioUpdateInput = {
        nombre: dto.nombre,
        alias: dto.alias,
        descripcion: dto.descripcion,
        urlcontrato: dto.urlcontrato,
        pathroute: dto.pathroute,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const servicioUpdated = await servicioDao.updateServicio(tx, dto.servicioid, servicioToUpdate);
      log.debug(line(), "servicioUpdated:", servicioUpdated);
      return servicioUpdated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getServiciosService = async () => {
  log.debug(line(), "service::getServiciosService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const servicios = await servicioDao.getServicios(tx, filter_estado);
      return servicios;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createServicioService = async (dto: CreateServicioDto) => {
  log.debug(line(), "service::createServicioService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const servicioCreate = {
        servicioid: uuidv4(),
        code: uuidv4().split("-")[0],
        nombre: dto.nombre,
        alias: dto.alias,
        descripcion: dto.descripcion,
        urlcontrato: dto.urlcontrato,
        pathroute: dto.pathroute,
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioCreated = await servicioDao.insertServicio(tx, servicioCreate);
      return servicioCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
