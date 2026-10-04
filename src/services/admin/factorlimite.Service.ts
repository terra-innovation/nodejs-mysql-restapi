import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as factorDao from "#root/src/daos/factor.Dao.js";
import * as factorlimiteDao from "#root/src/daos/factorlimite.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateFactorlimiteDto {
  factorid: string;
  monedaid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface UpdateFactorlimiteDto {
  factorlimiteid: string;
  total: number;
  usado?: number;
  disponible?: number;
  idusuario: number;
}

export interface DeleteFactorlimiteDto {
  factorlimiteid: string;
  idusuario: number;
}

export interface ActivateFactorlimiteDto {
  factorlimiteid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getFactorlimitesService = async () => {
  log.debug(line(), "service::getFactorlimitesService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factorlimites = await factorlimiteDao.getFactorlimites(tx, filter_estado);
      return factorlimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createFactorlimiteService = async (dto: CreateFactorlimiteDto) => {
  log.debug(line(), "service::createFactorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const factor = await factorDao.getFactorByFactorid(tx, dto.factorid);
      if (!factor) {
        log.warn(line(), "Factor no existe: [" + dto.factorid + "]");
        throw new ClientError("Factor no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + dto.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factorlimiteExistente = await factorlimiteDao.getFactorlimiteByIdfactorAndIdmoneda(
        tx,
        factor.idfactor,
        moneda.idmoneda,
        filter_estado,
      );

      if (factorlimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Factor [" + dto.factorid + "] y Moneda [" + dto.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Factor y Moneda", 400);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const factorlimiteToCreate: Prisma.factor_limiteCreateInput = {
        factorlimiteid: uuidv4(),
        code: uuidv4().split("-")[0],
        factor: { connect: { idfactor: factor.idfactor } },
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

      const result = await factorlimiteDao.insertFactorlimite(tx, factorlimiteToCreate);
      log.debug(line(), "factorlimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateFactorlimiteService = async (dto: UpdateFactorlimiteDto) => {
  log.debug(line(), "service::updateFactorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, dto.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + dto.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const total = dto.total;
      const usado = dto.usado ?? 0;
      const disponible = dto.disponible ?? total - usado;

      const factorlimiteToUpdate: Prisma.factor_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factorlimiteUpdated = await factorlimiteDao.updateFactorlimite(
        tx,
        factorlimite.factorlimiteid,
        factorlimiteToUpdate,
      );
      log.debug(line(), "factorlimiteUpdated:", factorlimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteFactorlimiteService = async (dto: DeleteFactorlimiteDto) => {
  log.debug(line(), "service::deleteFactorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, dto.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + dto.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const result = await factorlimiteDao.deleteFactorlimite(tx, factorlimite.factorlimiteid, dto.idusuario);
      log.debug(line(), "factorlimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateFactorlimiteService = async (dto: ActivateFactorlimiteDto) => {
  log.debug(line(), "service::activateFactorlimiteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, dto.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + dto.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const result = await factorlimiteDao.activateFactorlimite(tx, factorlimite.factorlimiteid, dto.idusuario);
      log.debug(line(), "factorlimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactorlimiteMasterService = async () => {
  log.debug(line(), "service::getFactorlimiteMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factores = await factorDao.getFactors(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const factorlimiteMaster: Record<string, any> = {
        factores,
        monedas,
      };

      return factorlimiteMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
