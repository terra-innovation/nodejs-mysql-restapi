import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestadoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import { CuentaBancariaEstadoAttributes } from "#src/models/ft_factoring/CuentaBancariaEstado.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";

export const activateCuentabancariaestado = async (req, res) => {
  log.debug(line(), "controller::activateCuentabancariaestado");
  const session_idusuario = req.session_user.usuario._idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAuditoria.idusuariomod = session_idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.activateCuentabancariaestado(transaction, { ...cuentabancariaestadoValidated, ...camposAuditoria });
    if (cuentabancariaestadoDeleted[0] === 0) {
      throw new ClientError("Cuentabancariaestado no existe", 404);
    }
    log.debug(line(), "cuentabancariaestadoActivated:", cuentabancariaestadoDeleted);
    await transaction.commit();
    response(res, 204, cuentabancariaestadoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteCuentabancariaestado = async (req, res) => {
  log.debug(line(), "controller::deleteCuentabancariaestado");
  const session_idusuario = req.session_user.usuario._idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAuditoria.idusuariomod = session_idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.deleteCuentabancariaestado(transaction, { ...cuentabancariaestadoValidated, ...camposAuditoria });
    if (cuentabancariaestadoDeleted[0] === 0) {
      throw new ClientError("Cuentabancariaestado no existe", 404);
    }
    log.debug(line(), "cuentabancariaestadoDeleted:", cuentabancariaestadoDeleted);
    await transaction.commit();
    response(res, 204, cuentabancariaestadoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateCuentabancariaestado = async (req, res) => {
  log.debug(line(), "controller::updateCuentabancariaestado");
  const session_idusuario = req.session_user.usuario._idusuario;
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAdicionales.cuentabancariaestadoid = id;

    var camposAuditoria: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAuditoria.idusuariomod = session_idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await cuentabancariaestadoDao.updateCuentabancariaestado(transaction, {
      ...camposAdicionales,
      ...cuentabancariaestadoValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Cuentabancariaestado no existe", 404);
    }
    log.info(line(), id);
    const cuentabancariaestadoUpdated = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(transaction, id);
    if (!cuentabancariaestadoUpdated) {
      throw new ClientError("Cuentabancariaestado no existe", 404);
    }

    var cuentabancariaestadoObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaestadoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //log.info(line(),empresaObfuscated);

    var cuentabancariaestadoFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadoObfuscated);
    await transaction.commit();
    response(res, 200, cuentabancariaestadoFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getCuentasbancarias = async (req, res) => {
  log.debug(line(), "controller::getCuentasbancarias");
  //log.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(transaction, filter_estado);
    var cuentabancariaestadosJson = jsonUtils.sequelizeToJSON(cuentabancariaestados);
    //log.info(line(),empresaObfuscated);

    //var cuentabancariaestadosFiltered = jsonUtils.removeAttributes(cuentabancariaestadosJson, ["score"]);
    //cuentabancariaestadosFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadosFiltered);
    await transaction.commit();
    response(res, 201, cuentabancariaestadosJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createCuentabancariaestado = async (req, res) => {
  log.debug(line(), "controller::createCuentabancariaestado");
  const session_idusuario = req.session_user.usuario._idusuario;
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAdicionales.cuentabancariaestadoid = uuidv4();

    var camposAuditoria: Partial<CuentaBancariaEstadoAttributes> = {};
    camposAuditoria.idusuariocrea = session_idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = session_idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const cuentabancariaestadoCreated = await cuentabancariaestadoDao.insertCuentabancariaestado(transaction, {
      ...camposAdicionales,
      ...cuentabancariaestadoValidated,
      ...camposAuditoria,
    });

    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...cuentabancariaestadoValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
