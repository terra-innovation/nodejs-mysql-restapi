import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as cedentelimiteDao from "#src/daos/cedentelimite.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getCedentelimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimites");
  const cedentelimites = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cedentelimites = await cedentelimiteDao.getCedentelimites(tx, filter_estado);
      return cedentelimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, cedentelimites);
};

export const createCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCedentelimite");
  const cedentelimiteCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  const cedentelimiteCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, cedentelimiteValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa (Cedente) no existe: [" + cedentelimiteValidated.empresaid + "]");
        throw new ClientError("Cedente no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, cedentelimiteValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + cedentelimiteValidated.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cedentelimiteExistente = await cedentelimiteDao.getCedentelimiteByIdcedenteAndIdmoneda(tx, empresa.idempresa, moneda.idmoneda, filter_estado);

      if (cedentelimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Cedente [" + cedentelimiteValidated.empresaid + "] y Moneda [" + cedentelimiteValidated.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Cedente y Moneda", 400);
      }

      const total = cedentelimiteValidated.total;
      const usado = cedentelimiteValidated.usado ?? 0;
      const disponible = cedentelimiteValidated.disponible ?? total - usado;

      const cedentelimiteToCreate: Prisma.cedente_limiteCreateInput = {
        cedentelimiteid: uuidv4(),
        code: uuidv4().split("-")[0],
        empresa: { connect: { idempresa: empresa.idempresa } },
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

      const result = await cedentelimiteDao.insertCedentelimite(tx, cedentelimiteToCreate);
      log.debug(line(), "cedentelimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, cedentelimiteCreated);
};

export const updateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCedentelimite");
  const { id } = req.params;
  const cedentelimiteUpdateSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteUpdateSchema.validateSync({ cedentelimiteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  await prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, cedentelimiteValidated.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + cedentelimiteValidated.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const total = cedentelimiteValidated.total;
      const usado = cedentelimiteValidated.usado ?? 0;
      const disponible = cedentelimiteValidated.disponible ?? total - usado;

      const cedentelimiteToUpdate: Prisma.cedente_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const cedentelimiteUpdated = await cedentelimiteDao.updateCedentelimite(tx, cedentelimite.cedentelimiteid, cedentelimiteToUpdate);
      log.debug(line(), "cedentelimiteUpdated:", cedentelimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const deleteCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteSchema.validateSync({ cedentelimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, cedentelimiteValidated.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + cedentelimiteValidated.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const result = await cedentelimiteDao.deleteCedentelimite(tx, cedentelimite.cedentelimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "cedentelimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const activateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteSchema.validateSync({ cedentelimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const cedentelimite = await cedentelimiteDao.getCedentelimiteByCedentelimiteid(tx, cedentelimiteValidated.cedentelimiteid);
      if (!cedentelimite) {
        log.warn(line(), "Límite de cedente no existe: [" + cedentelimiteValidated.cedentelimiteid + "]");
        throw new ClientError("Límite de cedente no encontrado", 404);
      }

      const result = await cedentelimiteDao.activateCedentelimite(tx, cedentelimite.cedentelimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "cedentelimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const getCedentelimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimiteMaster");
  const cedentelimiteMasterFiltered = await prismaFT.client.$transaction(
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
  response(res, 201, cedentelimiteMasterFiltered);
};
