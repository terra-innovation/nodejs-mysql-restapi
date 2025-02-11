import * as empresacuentabancariaDao from "../../daos/empresacuentabancariaDao.js";
import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as cuentabancariaestadoDao from "../../daos/cuentabancariaestadoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activateEmpresacuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::activateEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      logger.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      logger.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentaBancariaActivate = {};
    camposCuentaBancariaActivate.cuentabancariaid = cuentabancaria.cuentabancariaid;
    camposCuentaBancariaActivate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaActivate.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaActivate.estado = 1;

    const camposCuentaBancariaActivated = await cuentabancariaDao.deleteCuentabancaria(transaction, { ...camposCuentaBancariaActivate });
    logger.debug(line(), "camposCuentaBancariaActivated:", camposCuentaBancariaActivated);

    await transaction.commit();
    response(res, 204, {});
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteEmpresacuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::deleteEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      logger.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      logger.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentaBancariaDelete = {};
    camposCuentaBancariaDelete.cuentabancariaid = cuentabancaria.cuentabancariaid;
    camposCuentaBancariaDelete.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaDelete.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaDelete.estado = 2;

    const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(transaction, { ...camposCuentaBancariaDelete });
    logger.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);

    await transaction.commit();
    response(res, 204, {});
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getEmpresacuentabancariaMaster = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const empresas = await empresaDao.getEmpresas(transaction, filter_estados);

    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);
    const empresacuentabancariaestados = await cuentabancariaestadoDao.getCuentaBancariaEstados(transaction, filter_estados);

    var cuentasbancariasMaster = {};
    cuentasbancariasMaster.empresas = empresas;
    cuentasbancariasMaster.bancos = bancos;
    cuentasbancariasMaster.monedas = monedas;
    cuentasbancariasMaster.cuentatipos = cuentatipos;
    cuentasbancariasMaster.empresacuentabancariaestados = empresacuentabancariaestados;

    var cuentasbancariasMasterJSON = jsonUtils.sequelizeToJSON(cuentasbancariasMaster);
    //jsonUtils.prettyPrint(cuentasbancariasMasterJSON);
    var cuentasbancariasMasterObfuscated = cuentasbancariasMasterJSON;
    //jsonUtils.prettyPrint(cuentasbancariasMasterObfuscated);
    var cuentasbancariasMasterFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasMasterObfuscated);
    //jsonUtils.prettyPrint(cuentasbancariasMaster);
    await transaction.commit();
    response(res, 201, cuentasbancariasMasterFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req, res) => {
  logger.debug(line(), "controller::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ empresacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(transaction, empresacuentabancariaValidated.cuentabancariaestadoid);
    if (!empresacuentabancariaestado) {
      logger.warn(line(), "Cuenta bancaria estado no existe: [" + empresacuentabancariaValidated.cuentabancariaestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      logger.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      logger.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentabancariaFk = {};
    camposCuentabancariaFk._idcuentabancariaestado = empresacuentabancariaestado._idcuentabancariaestado;

    var camposCuentabancariaAdicionales = {};
    camposCuentabancariaAdicionales.cuentabancariaid = cuentabancaria.cuentabancariaid;

    var camposCuentabancariaAuditoria = {};
    camposCuentabancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentabancariaAuditoria.fechamod = Sequelize.fn("now", 3);

    const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposCuentabancariaFk,
      ...camposCuentabancariaAdicionales,
      ...empresacuentabancariaValidated,
      ...camposCuentabancariaAuditoria,
    });
    logger.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getEmpresacuentabancarias = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancarias");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const cuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancarias(transaction, filter_estado);
    var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);

    await transaction.commit();
    response(res, 201, cuentasbancariasJson);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createEmpresacuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const empresacuentabancariaCreateSchema = yup
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
  var empresacuentabancariaValidated = empresacuentabancariaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, empresacuentabancariaValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, empresacuentabancariaValidated.bancoid);
    if (!banco) {
      logger.warn(line(), "Banco no existe: [" + empresacuentabancariaValidated.bancoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, empresacuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      logger.warn(line(), "Cuenta tipo no existe: [" + empresacuentabancariaValidated.cuentatipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, empresacuentabancariaValidated.monedaid);
    if (!moneda) {
      logger.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, empresacuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      logger.warn(line(), "El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
      throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(transaction, empresa._idempresa, empresacuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      logger.warn(line(), "El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
      throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
    }

    var camposCuentaBancariaFk = {};
    camposCuentaBancariaFk._idempresa = empresa._idempresa;
    camposCuentaBancariaFk._idbanco = banco._idbanco;
    camposCuentaBancariaFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposCuentaBancariaFk._idmoneda = moneda._idmoneda;
    camposCuentaBancariaFk._idcuentabancariaestado = 1; // Por defecto

    var camposCuentaBancariaAdicionales = {};
    camposCuentaBancariaAdicionales.empresacuentabancariaid = uuidv4();
    camposCuentaBancariaAdicionales.code = uuidv4().split("-")[0];

    var camposCuentaBancariaAuditoria = {};
    camposCuentaBancariaAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposCuentaBancariaFk,
      ...camposCuentaBancariaAdicionales,
      ...empresacuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

    var camposEmpresaCuentaBancariaCreate = {};
    camposEmpresaCuentaBancariaCreate._idempresa = empresa._idempresa;
    camposEmpresaCuentaBancariaCreate._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;
    camposEmpresaCuentaBancariaCreate.empresacuentabancariaid = uuidv4();
    camposEmpresaCuentaBancariaCreate.code = uuidv4().split("-")[0];
    camposEmpresaCuentaBancariaCreate.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposEmpresaCuentaBancariaCreate.fechacrea = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposEmpresaCuentaBancariaCreate.fechamod = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.estado = 1;

    const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(transaction, camposEmpresaCuentaBancariaCreate);
    logger.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

    const empresacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposEmpresaCuentaBancariaCreate);

    await transaction.commit();
    response(res, 201, { ...empresacuentabancariaFiltered });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
