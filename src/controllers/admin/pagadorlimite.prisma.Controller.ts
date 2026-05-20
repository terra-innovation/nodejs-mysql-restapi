import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as pagadorlimiteDao from "#src/daos/pagadorlimite.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getPagadorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimites");
  const pagadorlimites = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const pagadorlimites = await pagadorlimiteDao.getPagadorlimites(tx, filter_estado);
      return pagadorlimites;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, pagadorlimites);
};

export const createPagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createPagadorlimite");
  const pagadorlimiteCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  const pagadorlimiteCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, pagadorlimiteValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa (Pagador) no existe: [" + pagadorlimiteValidated.empresaid + "]");
        throw new ClientError("Pagador no encontrado", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, pagadorlimiteValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + pagadorlimiteValidated.monedaid + "]");
        throw new ClientError("Moneda no encontrada", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const pagadorlimiteExistente = await pagadorlimiteDao.getPagadorlimiteByIdpagadorAndIdmoneda(
        tx,
        empresa.idempresa,
        moneda.idmoneda,
        filter_estado
      );

      if (pagadorlimiteExistente) {
        log.warn(line(), "Ya existe un límite para el Pagador [" + pagadorlimiteValidated.empresaid + "] y Moneda [" + pagadorlimiteValidated.monedaid + "]");
        throw new ClientError("Ya existe un límite configurado para este Pagador y Moneda", 400);
      }

      const total = pagadorlimiteValidated.total;
      const usado = pagadorlimiteValidated.usado ?? 0;
      const disponible = pagadorlimiteValidated.disponible ?? (total - usado);

      const pagadorlimiteToCreate: Prisma.pagador_limiteCreateInput = {
        pagadorlimiteid: uuidv4(),
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

      const result = await pagadorlimiteDao.insertPagadorlimite(tx, pagadorlimiteToCreate);
      log.debug(line(), "pagadorlimiteCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, pagadorlimiteCreated);
};

export const updatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteUpdateSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteUpdateSchema.validateSync({ pagadorlimiteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  await prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, pagadorlimiteValidated.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + pagadorlimiteValidated.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const total = pagadorlimiteValidated.total;
      const usado = pagadorlimiteValidated.usado ?? 0;
      const disponible = pagadorlimiteValidated.disponible ?? (total - usado);

      const pagadorlimiteToUpdate: Prisma.pagador_limiteUpdateInput = {
        total: total,
        usado: usado,
        disponible: disponible,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const pagadorlimiteUpdated = await pagadorlimiteDao.updatePagadorlimite(tx, pagadorlimite.pagadorlimiteid, pagadorlimiteToUpdate);
      log.debug(line(), "pagadorlimiteUpdated:", pagadorlimiteUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const deletePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteSchema.validateSync({ pagadorlimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, pagadorlimiteValidated.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + pagadorlimiteValidated.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const result = await pagadorlimiteDao.deletePagadorlimite(tx, pagadorlimite.pagadorlimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "pagadorlimiteDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const activatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteSchema.validateSync({ pagadorlimiteid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const pagadorlimite = await pagadorlimiteDao.getPagadorlimiteByPagadorlimiteid(tx, pagadorlimiteValidated.pagadorlimiteid);
      if (!pagadorlimite) {
        log.warn(line(), "Límite de pagador no existe: [" + pagadorlimiteValidated.pagadorlimiteid + "]");
        throw new ClientError("Límite de pagador no encontrado", 404);
      }

      const result = await pagadorlimiteDao.activatePagadorlimite(tx, pagadorlimite.pagadorlimiteid, req.session_user.usuario.idusuario);
      log.debug(line(), "pagadorlimiteActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const getPagadorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimiteMaster");
  const pagadorlimiteMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const pagadorlimiteMaster: Record<string, any> = {
        pagadores: empresas,
        monedas,
      };

      const pagadorlimiteMasterJSON = jsonUtils.sequelizeToJSON(pagadorlimiteMaster);
      const pagadorlimiteMasterFiltered = jsonUtils.removeAttributesPrivates(pagadorlimiteMasterJSON);
      return pagadorlimiteMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, pagadorlimiteMasterFiltered);
};
