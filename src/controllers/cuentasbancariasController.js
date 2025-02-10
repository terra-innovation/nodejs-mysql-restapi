import * as cuentabancariaDao from "../daos/cuentabancariaDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";
import logger, { line } from "../utils/logger.js";
import { sequelizeFT } from "../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getCuentasbancarias = async (req, res) => {
  logger.debug(line(), "controller::getCuentasbancarias");
  const filter_estado = [1, 2];
  const transaction = await sequelizeFT.transaction();
  try {
    const cuentasbancarias = await cuentabancariaDao.getCuentasbancarias(transaction, filter_estado);
    var cuentasbancariasObfuscated = jsonUtils.ofuscarAtributos(cuentasbancarias, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasObfuscated);
    await transaction.commit();
    response(res, 201, cuentasbancariasFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCuentasbancariasMiosByEmpresaidActivos = async (req, res) => {
  logger.debug(line(), "controller::getCuentasbancariasMiosByEmpresaidActivos");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var cuentabancariaValidated = cuentabancariaSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, req.session_user.usuario._idusuario, cuentabancariaValidated.empresaid, 1);
    //logger.info(line(),empresa);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }
    const filter_empresaid = cuentabancariaValidated.empresaid;
    const filter_monedaid = cuentabancariaValidated.monedaid;
    const filter_idcuentabancariaestado = [2];
    const filter_estado = [1, 2];
    const cuentasbancarias = await cuentabancariaDao.getCuentasbancariasByEmpresaidAndMoneda(transaction, filter_empresaid, filter_monedaid, filter_idcuentabancariaestado, filter_estado);
    var cuentasbancariasObfuscated = jsonUtils.ofuscarAtributos(cuentasbancarias, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasObfuscated, ["score"]);
    cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
    await transaction.commit();
    response(res, 201, cuentasbancariasFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::getCuentabancaria");
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var cuentabancariaValidated = cuentabancariaSchema.validateSync({ cuentabancariaid: id }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const cuentabancaria = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(transaction, cuentabancariaValidated.cuentabancariaid);
    if (!cuentabancaria) {
      throw new ClientError("Cuentabancaria no existe", 404);
    }
    var cuentabancariaObfuscated = jsonUtils.ofuscarAtributos(cuentabancaria, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var cuentabancariaFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaObfuscated);
    await transaction.commit();
    response(res, 200, cuentabancariaFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createCuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::createCuentabancaria");
  const cuentabancariaCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var cuentabancariaValidated = cuentabancariaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, cuentabancariaValidated.empresaid);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, cuentabancariaValidated.bancoid);
    if (!banco) {
      throw new ClientError("Banco no existe", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, cuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      throw new ClientError("Cuenta tipo no existe", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, cuentabancariaValidated.monedaid);
    if (!moneda) {
      throw new ClientError("Moneda no existe", 404);
    }

    var camposFk = {};
    camposFk._idempresa = empresa._idempresa;
    camposFk._idbanco = banco._idbanco;
    camposFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposFk._idmoneda = moneda._idmoneda;
    camposFk._idcuentabancariaestado = 1; // Por defecto

    var camposAdicionales = {};
    camposAdicionales.cuentabancariaid = uuidv4();

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...cuentabancariaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "Create cuentabancaria: ID:" + cuentabancariaCreated.idcuentabancaria + " | " + camposAdicionales.cuentabancariaid);
    logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...cuentabancariaValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateCuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::updateCuentabancaria");
  const { id } = req.params;
  const cuentabancariaUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaUpdateSchema.validateSync({ cuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales = {};
    camposAdicionales.cuentabancariaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposAdicionales,
      ...cuentabancariaValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Cuentabancaria no existe", 404);
    }
    logger.info(line(), id);
    const cuentabancariaUpdated = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(transaction, id);
    if (!cuentabancariaUpdated) {
      throw new ClientError("Cuentabancaria no existe", 404);
    }

    var cuentabancariaObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var cuentabancariaFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaObfuscated);
    await transaction.commit();
    response(res, 200, cuentabancariaFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteCuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::deleteCuentabancaria");
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaSchema.validateSync({ cuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(transaction, { ...cuentabancariaValidated, ...camposAuditoria });
    if (cuentabancariaDeleted[0] === 0) {
      throw new ClientError("Cuentabancaria no existe", 404);
    }
    logger.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);
    await transaction.commit();
    response(res, 204, cuentabancariaDeleted);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
