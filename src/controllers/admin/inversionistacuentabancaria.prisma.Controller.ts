import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as inversionistacuentabancariaDao from "#src/daos/inversionistacuentabancariaDao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as inversionistaDao from "#src/daos/inversionistaDao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestadoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { CuentaBancariaAttributes } from "#root/src/models/ft_factoring/CuentaBancaria";
import { InversionistaCuentaBancariaAttributes } from "#root/src/models/ft_factoring/InversionistaCuentaBancaria";

export const updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync({ inversionistacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(tx, inversionistacuentabancariaValidated.cuentabancariaestadoid);
      if (!inversionistacuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + inversionistacuentabancariaValidated.cuentabancariaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria._idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria._idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposCuentabancariaFk: Partial<CuentaBancariaAttributes> = {};
      camposCuentabancariaFk._idcuentabancariaestado = inversionistacuentabancariaestado._idcuentabancariaestado;

      var camposCuentabancariaAdicionales: Partial<CuentaBancariaAttributes> = {};
      camposCuentabancariaAdicionales.cuentabancariaid = cuentabancaria.cuentabancariaid;

      var camposCuentabancariaAuditoria: Partial<CuentaBancariaAttributes> = {};
      camposCuentabancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposCuentabancariaAuditoria.fechamod = new Date();

      const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(tx, {
        ...camposCuentabancariaFk,
        ...camposCuentabancariaAdicionales,
        ...inversionistacuentabancariaValidated,
        ...camposCuentabancariaAuditoria,
      });
      log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  //log.info(line(),req.session_user.usuario._idusuario);
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const cuentasbancarias = await inversionistacuentabancariaDao.getInversionistacuentabancarias(tx, filter_estado);
      var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentasbancariasJson);
};

export const activateInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync({ inversionistacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria._idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria._idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposCuentaBancariaActivate: Partial<CuentaBancariaAttributes> = {};
      camposCuentaBancariaActivate.cuentabancariaid = cuentabancaria.cuentabancariaid;
      camposCuentaBancariaActivate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposCuentaBancariaActivate.fechamod = new Date();
      camposCuentaBancariaActivate.estado = 1;

      const camposCuentaBancariaActivated = await cuentabancariaDao.deleteCuentabancaria(tx, { ...camposCuentaBancariaActivate });
      log.debug(line(), "camposCuentaBancariaActivated:", camposCuentaBancariaActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const deleteInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync({ inversionistacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria._idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria._idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposCuentaBancariaDelete: Partial<CuentaBancariaAttributes> = {};
      camposCuentaBancariaDelete.cuentabancariaid = cuentabancaria.cuentabancariaid;
      camposCuentaBancariaDelete.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposCuentaBancariaDelete.fechamod = new Date();
      camposCuentaBancariaDelete.estado = 2;

      const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(tx, { ...camposCuentaBancariaDelete });
      log.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const inversionistas = await inversionistaDao.getInversionistas(tx, filter_estados);

      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estados);

      var cuentasbancariasMaster: Record<string, any> = {};
      cuentasbancariasMaster.inversionistas = inversionistas;
      cuentasbancariasMaster.bancos = bancos;
      cuentasbancariasMaster.monedas = monedas;
      cuentasbancariasMaster.cuentatipos = cuentatipos;
      cuentasbancariasMaster.cuentabancariaestados = cuentabancariaestados;

      var cuentasbancariasMasterJSON = jsonUtils.sequelizeToJSON(cuentasbancariasMaster);
      //jsonUtils.prettyPrint(cuentasbancariasMasterJSON);
      var cuentasbancariasMasterObfuscated = cuentasbancariasMasterJSON;
      //jsonUtils.prettyPrint(cuentasbancariasMasterObfuscated);
      var cuentasbancariasMasterFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasMasterObfuscated);
      //jsonUtils.prettyPrint(cuentasbancariasMaster);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentasbancariasMasterFiltered);
};

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const inversionistacuentabancariaCreateSchema = yup
    .object()
    .shape({
      inversionistaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionista = await inversionistaDao.getInversionistaByInversionistaid(tx, inversionistacuentabancariaValidated.inversionistaid);
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + inversionistacuentabancariaValidated.inversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var banco = await bancoDao.findBancoPk(tx, inversionistacuentabancariaValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + inversionistacuentabancariaValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, inversionistacuentabancariaValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + inversionistacuentabancariaValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      var moneda = await monedaDao.findMonedaPk(tx, inversionistacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + inversionistacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco._idbanco, inversionistacuentabancariaValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      var cuentasbancarias_por_alias = await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(tx, inversionista._idinversionista, inversionistacuentabancariaValidated.alias, filter_estado);
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      var camposCuentaBancariaFk: Partial<CuentaBancariaAttributes> = {};
      camposCuentaBancariaFk._idbanco = banco._idbanco;
      camposCuentaBancariaFk._idcuentatipo = cuentatipo._idcuentatipo;
      camposCuentaBancariaFk._idmoneda = moneda._idmoneda;
      camposCuentaBancariaFk._idcuentabancariaestado = 1; // Por defecto

      var camposCuentaBancariaAdicionales: Partial<CuentaBancariaAttributes> = {};
      camposCuentaBancariaAdicionales.cuentabancariaid = uuidv4();
      camposCuentaBancariaAdicionales.code = uuidv4().split("-")[0];

      var camposCuentaBancariaAuditoria: Partial<CuentaBancariaAttributes> = {};
      camposCuentaBancariaAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
      camposCuentaBancariaAuditoria.fechacrea = new Date();
      camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposCuentaBancariaAuditoria.fechamod = new Date();
      camposCuentaBancariaAuditoria.estado = 1;

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, {
        ...camposCuentaBancariaFk,
        ...camposCuentaBancariaAdicionales,
        ...inversionistacuentabancariaValidated,
        ...camposCuentaBancariaAuditoria,
      });
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated.dataValues);

      var camposInversionistaCuentaBancariaCreate: Partial<InversionistaCuentaBancariaAttributes> = {};
      camposInversionistaCuentaBancariaCreate._idinversionista = inversionista._idinversionista;
      camposInversionistaCuentaBancariaCreate._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;
      camposInversionistaCuentaBancariaCreate.inversionistacuentabancariaid = uuidv4();
      camposInversionistaCuentaBancariaCreate.code = uuidv4().split("-")[0];
      camposInversionistaCuentaBancariaCreate.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
      camposInversionistaCuentaBancariaCreate.fechacrea = new Date();
      camposInversionistaCuentaBancariaCreate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposInversionistaCuentaBancariaCreate.fechamod = new Date();
      camposInversionistaCuentaBancariaCreate.estado = 1;

      const inversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, camposInversionistaCuentaBancariaCreate);
      log.debug(line(), "inversionistacuentabancariaCreated:", inversionistacuentabancariaCreated.dataValues);

      const inversionistacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposInversionistaCuentaBancariaCreate);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...inversionistacuentabancariaFiltered });
};
