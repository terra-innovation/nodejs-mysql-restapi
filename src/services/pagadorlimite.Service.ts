import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as pagadorlimiteDao from "#root/src/daos/pagadorlimite.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreatePagadorlimiteDto {
  empresaid: string;
  monedaid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface UpdatePagadorlimiteDto {
  pagadorlimiteid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface DeletePagadorlimiteDto {
  pagadorlimiteid: string;
  idusuario: number;
}

export interface ActivatePagadorlimiteDto {
  pagadorlimiteid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getPagadorlimitesService = async () => {
  log.debug(line(), "service::getPagadorlimitesService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const pagadorlimites = await pagadorlimiteDao.getPagadorlimites(tx, filter_estado);
      return pagadorlimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createPagadorlimiteService = async (dto: CreatePagadorlimiteDto) => {
  log.debug(line(), "service::createPagadorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, dto.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa (Pagador) no existe: [" + dto.empresaid + "]");
        throw new ClientError("Pagador no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + dto.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const pagadorlimiteExistente = await pagadorlimiteDao.getPagadorlimiteByIdpagadorAndIdmoneda(
        tx,
        empresa.idempresa,
        moneda.idmoneda,
        filter_estado,
      );

      if (pagadorlimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Pagador [" + dto.empresaid + "] y Moneda [" + dto.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Pagador y Moneda", 400);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const pagadorlimiteToCreate: Prisma.pagador_limiteCreateInput = {
        pagadorlimiteid: uuidv4(),
        code: uuidv4().split("-")[0],
        empresa: { connect: { idempresa: empresa.idempresa } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        usado: usado,
        disponible: disponible,
        total: total,
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await pagadorlimiteDao.insertPagadorlimite(tx, pagadorlimiteToCreate);
      log.debug(line(), "pagadorlimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updatePagadorlimiteService = async (dto: UpdatePagadorlimiteDto) => {
  log.debug(line(), "service::updatePagadorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, dto.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + dto.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const pagadorlimiteToUpdate: Prisma.pagador_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const pagadorlimiteUpdated = await pagadorlimiteDao.updatePagadorlimite(
        tx,
        pagadorlimite.pagadorlimiteid,
        pagadorlimiteToUpdate,
      );
      log.debug(line(), "pagadorlimiteUpdated:", pagadorlimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deletePagadorlimiteService = async (dto: DeletePagadorlimiteDto) => {
  log.debug(line(), "service::deletePagadorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, dto.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + dto.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const result = await pagadorlimiteDao.deletePagadorlimite(tx, pagadorlimite.pagadorlimiteid, dto.idusuario);
      log.debug(line(), "pagadorlimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activatePagadorlimiteService = async (dto: ActivatePagadorlimiteDto) => {
  log.debug(line(), "service::activatePagadorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, dto.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + dto.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const result = await pagadorlimiteDao.activatePagadorlimite(tx, pagadorlimite.pagadorlimiteid, dto.idusuario);
      log.debug(line(), "pagadorlimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getPagadorlimiteMasterService = async () => {
  log.debug(line(), "service::getPagadorlimiteMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const pagadorlimiteMaster: Record<string, any> = {
        pagadores: empresas,
        monedas,
      };

      return pagadorlimiteMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
