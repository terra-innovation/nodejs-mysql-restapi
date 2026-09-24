import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as cedentelimiteDao from "#root/src/daos/cedentelimite.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateCedentelimiteDto {
  empresaid: string;
  monedaid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface UpdateCedentelimiteDto {
  cedentelimiteid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface DeleteCedentelimiteDto {
  cedentelimiteid: string;
  idusuario: number;
}

export interface ActivateCedentelimiteDto {
  cedentelimiteid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getCedentelimitesService = async () => {
  log.debug(line(), "service::getCedentelimitesService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cedentelimites = await cedentelimiteDao.getCedentelimites(tx, filter_estado);
      return cedentelimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createCedentelimiteService = async (dto: CreateCedentelimiteDto) => {
  log.debug(line(), "service::createCedentelimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, dto.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa (Cedente) no existe: [" + dto.empresaid + "]");
        throw new ClientError("Cedente no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + dto.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cedentelimiteExistente = await cedentelimiteDao.getCedentelimiteByIdcedenteAndIdmoneda(
        tx,
        empresa.idempresa,
        moneda.idmoneda,
        filter_estado,
      );

      if (cedentelimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Cedente [" + dto.empresaid + "] y Moneda [" + dto.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Cedente y Moneda", 400);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const cedentelimiteToCreate: Prisma.cedente_limiteCreateInput = {
        cedentelimiteid: uuidv4(),
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

      const result = await cedentelimiteDao.insertCedentelimite(tx, cedentelimiteToCreate);
      log.debug(line(), "cedentelimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateCedentelimiteService = async (dto: UpdateCedentelimiteDto) => {
  log.debug(line(), "service::updateCedentelimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, dto.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + dto.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const cedentelimiteToUpdate: Prisma.cedente_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const cedentelimiteUpdated = await cedentelimiteDao.updateCedentelimite(
        tx,
        cedentelimite.cedentelimiteid,
        cedentelimiteToUpdate,
      );
      log.debug(line(), "cedentelimiteUpdated:", cedentelimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteCedentelimiteService = async (dto: DeleteCedentelimiteDto) => {
  log.debug(line(), "service::deleteCedentelimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, dto.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + dto.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const result = await cedentelimiteDao.deleteCedentelimite(tx, cedentelimite.cedentelimiteid, dto.idusuario);
      log.debug(line(), "cedentelimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateCedentelimiteService = async (dto: ActivateCedentelimiteDto) => {
  log.debug(line(), "service::activateCedentelimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, dto.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + dto.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const result = await cedentelimiteDao.activateCedentelimite(tx, cedentelimite.cedentelimiteid, dto.idusuario);
      log.debug(line(), "cedentelimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getCedentelimiteMasterService = async () => {
  log.debug(line(), "service::getCedentelimiteMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const cedentelimiteMaster: Record<string, any> = {
        cedentes: empresas,
        monedas,
      };

      return cedentelimiteMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
