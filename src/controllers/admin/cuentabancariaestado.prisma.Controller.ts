import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { cuenta_bancaria_estado } from "#src/models/prisma/ft_factoring/client";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const activateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCuentabancariaestado");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<cuenta_bancaria_estado> = {};
      camposAuditoria.idusuariomod = session_idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.activateCuentabancariaestado(tx, { ...cuentabancariaestadoValidated, ...camposAuditoria });
      if (cuentabancariaestadoDeleted[0] === 0) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }
      log.debug(line(), "cuentabancariaestadoActivated:", cuentabancariaestadoDeleted);
      return cuentabancariaestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, cuentabancariaestadoDeleted);
};

export const deleteCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCuentabancariaestado");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<cuenta_bancaria_estado> = {};
      camposAuditoria.idusuariomod = session_idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.deleteCuentabancariaestado(tx, { ...cuentabancariaestadoValidated, ...camposAuditoria });
      if (cuentabancariaestadoDeleted[0] === 0) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }
      log.debug(line(), "cuentabancariaestadoDeleted:", cuentabancariaestadoDeleted);
      return cuentabancariaestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, cuentabancariaestadoDeleted);
};

export const updateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCuentabancariaestado");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const cuentabancariaestadoUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoUpdateSchema.validateSync({ cuentabancariaestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAdicionales: Partial<cuenta_bancaria_estado> = {};
      camposAdicionales.cuentabancariaestadoid = id;

      var camposAuditoria: Partial<cuenta_bancaria_estado> = {};
      camposAuditoria.idusuariomod = session_idusuario ?? 1;
      camposAuditoria.fechamod = new Date();

      const result = await cuentabancariaestadoDao.updateCuentabancariaestado(tx, {
        ...camposAdicionales,
        ...cuentabancariaestadoValidated,
        ...camposAuditoria,
      });
      if (result[0] === 0) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }
      log.info(line(), id);
      const cuentabancariaestadoUpdated = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(tx, id);
      if (!cuentabancariaestadoUpdated) {
        throw new ClientError("Cuentabancariaestado no existe", 404);
      }

      var cuentabancariaestadoObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaestadoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
      //log.info(line(),empresaObfuscated);

      var cuentabancariaestadoFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadoObfuscated);
      return cuentabancariaestadoFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, cuentabancariaestadoFiltered);
};

export const getCuentasbancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCuentasbancarias");
  //log.info(line(),req.session_user.usuario.idusuario);

  const cuentabancariaestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estado);
      var cuentabancariaestadosJson = jsonUtils.sequelizeToJSON(cuentabancariaestados);
      //log.info(line(),empresaObfuscated);

      //var cuentabancariaestadosFiltered = jsonUtils.removeAttributes(cuentabancariaestadosJson, ["score"]);
      //cuentabancariaestadosFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadosFiltered);
      return cuentabancariaestadosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentabancariaestadosJson);
};

export const createCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCuentabancariaestado");
  const session_idusuario = req.session_user.usuario.idusuario;
  const cuentabancariaestadoCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  var cuentabancariaestadoValidated = cuentabancariaestadoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const cuentabancariaestadoCreate: Prisma.cuenta_bancaria_estadoCreateInput = {
        cuentabancariaestadoid: uuidv4(),
        nombre: cuentabancariaestadoValidated.nombre,
        alias: cuentabancariaestadoValidated.alias,
        color: cuentabancariaestadoValidated.color,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaestadoCreated = await cuentabancariaestadoDao.insertCuentabancariaestado(tx, cuentabancariaestadoCreate);

      return cuentabancariaestadoCreated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentabancariaestadoCreated);
};
