import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as cuentabancariaestadoDao from "#root/src/daos/cuentabancariaestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ActivateCuentabancariaestadoDto {
  cuentabancariaestadoid: string;
  idusuario: number;
}

export interface DeleteCuentabancariaestadoDto {
  cuentabancariaestadoid: string;
  idusuario: number;
}

export interface UpdateCuentabancariaestadoDto {
  cuentabancariaestadoid: string;
  nombre: string;
  alias: string;
  color: string;
  idusuario: number;
}

export interface CreateCuentabancariaestadoDto {
  nombre: string;
  alias: string;
  color: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const activateCuentabancariaestadoService = async (dto: ActivateCuentabancariaestadoDto) => {
  log.debug(line(), "service::activateCuentabancariaestadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cuentabancariaestadoActivated = await cuentabancariaestadoDao.activateCuentabancariaestado(
        tx,
        dto.cuentabancariaestadoid,
        dto.idusuario,
      );
      log.debug(line(), "cuentabancariaestadoActivated:", cuentabancariaestadoActivated);
      return cuentabancariaestadoActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteCuentabancariaestadoService = async (dto: DeleteCuentabancariaestadoDto) => {
  log.debug(line(), "service::deleteCuentabancariaestadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.deleteCuentabancariaestado(
        tx,
        dto.cuentabancariaestadoid,
        dto.idusuario,
      );
      log.debug(line(), "cuentabancariaestadoDeleted:", cuentabancariaestadoDeleted);
      return cuentabancariaestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateCuentabancariaestadoService = async (dto: UpdateCuentabancariaestadoDto) => {
  log.debug(line(), "service::updateCuentabancariaestadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cuentabancariaestadoToUpdate: Prisma.cuenta_bancaria_estadoUpdateInput = {
        nombre: dto.nombre,
        alias: dto.alias,
        color: dto.color,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await cuentabancariaestadoDao.updateCuentabancariaestado(
        tx,
        dto.cuentabancariaestadoid,
        cuentabancariaestadoToUpdate,
      );
      if (result[0] === 0) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }

      const cuentabancariaestadoUpdated = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(
        tx,
        dto.cuentabancariaestadoid,
      );
      if (!cuentabancariaestadoUpdated) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }

      const cuentabancariaestadoObfuscated = jsonUtils.ofuscarAtributos(
        cuentabancariaestadoUpdated,
        ["numero", "cci"],
        jsonUtils.PATRON_OFUSCAR_CUENTA,
      );
      const cuentabancariaestadoFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadoObfuscated);
      return cuentabancariaestadoFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getCuentabancariaestadosService = async () => {
  log.debug(line(), "service::getCuentabancariaestadosService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estado);
      return cuentabancariaestados;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createCuentabancariaestadoService = async (dto: CreateCuentabancariaestadoDto) => {
  log.debug(line(), "service::createCuentabancariaestadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cuentabancariaestadoToCreate: Prisma.cuenta_bancaria_estadoCreateInput = {
        cuentabancariaestadoid: uuidv4(),
        nombre: dto.nombre,
        alias: dto.alias,
        color: dto.color,
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaestadoCreated = await cuentabancariaestadoDao.insertCuentabancariaestado(
        tx,
        cuentabancariaestadoToCreate,
      );
      return cuentabancariaestadoCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
