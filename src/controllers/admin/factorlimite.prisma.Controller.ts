import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factorlimiteDao from "#src/daos/factorlimite.prisma.Dao.js";
import * as factorDao from "#src/daos/factor.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getFactorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimites");
  const factorlimites = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factorlimites = await factorlimiteDao.getFactorlimites(tx, filter_estado);
      return factorlimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorlimites);
};

export const createFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactorlimite");
  const factorlimiteCreateSchema = yup
    .object()
    .shape({
      factorid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const factorlimiteValidated = factorlimiteCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  const factorlimiteCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const factor = await factorDao.getFactorByFactorid(tx, factorlimiteValidated.factorid);
      if (!factor) {
        log.warn(line(), "Factor no existe: [" + factorlimiteValidated.factorid + "]");
        throw new ClientError("Factor no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, factorlimiteValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factorlimiteValidated.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factorlimiteExistente = await factorlimiteDao.getFactorlimiteByIdfactorAndIdmoneda(
        tx,
        factor.idfactor,
        moneda.idmoneda,
        filter_estado
      );

      if (factorlimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Factor [" + factorlimiteValidated.factorid + "] y Moneda [" + factorlimiteValidated.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Factor y Moneda", 400);
      }

      const total = factorlimiteValidated.total;
      const usado = factorlimiteValidated.usado ?? 0;
      const disponible = factorlimiteValidated.disponible ?? (total - usado);

      const factorlimiteToCreate: Prisma.factor_limiteCreateInput = {
        factorlimiteid: uuidv4(),
        code: uuidv4().split("-")[0],
        factor: { connect: { idfactor: factor.idfactor } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        usado: usado,
        disponible: disponible,
        total: total,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await factorlimiteDao.insertFactorlimite(tx, factorlimiteToCreate);
      log.debug(line(), "factorlimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorlimiteCreated);
};

export const updateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactorlimite");
  const { id } = req.params;
  const factorlimiteUpdateSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const factorlimiteValidated = factorlimiteUpdateSchema.validateSync({ factorlimiteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  await prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, factorlimiteValidated.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + factorlimiteValidated.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const total = factorlimiteValidated.total;
      const usado = factorlimiteValidated.usado ?? 0;
      const disponible = factorlimiteValidated.disponible ?? (total - usado);

      const factorlimiteToUpdate: Prisma.factor_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factorlimiteUpdated = await factorlimiteDao.updateFactorlimite(tx, factorlimite.factorlimiteid, factorlimiteToUpdate);
      log.debug(line(), "factorlimiteUpdated:", factorlimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const deleteFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factorlimiteValidated = factorlimiteSchema.validateSync({ factorlimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, factorlimiteValidated.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + factorlimiteValidated.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const result = await factorlimiteDao.deleteFactorlimite(tx, factorlimite.factorlimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "factorlimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const activateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factorlimiteValidated = factorlimiteSchema.validateSync({ factorlimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const factorlimite = await factorlimiteDao.getFactorlimiteByFactorlimiteid(tx, factorlimiteValidated.factorlimiteid);
      if (!factorlimite) {
        log.warn(line(), "Límite de factor no existe: [" + factorlimiteValidated.factorlimiteid + "]");
        throw new ClientError("Límite de factor no encontrado", 404);
      }

      const result = await factorlimiteDao.activateFactorlimite(tx, factorlimite.factorlimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "factorlimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const getFactorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimiteMaster");
  const factorlimiteMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factores = await factorDao.getFactors(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const factorlimiteMaster: Record<string, any> = {
        factores,
        monedas,
      };

      const factorlimiteMasterJSON = jsonUtils.sequelizeToJSON(factorlimiteMaster);
      const factorlimiteMasterFiltered = jsonUtils.removeAttributesPrivates(factorlimiteMasterJSON);
      return factorlimiteMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorlimiteMasterFiltered);
};
