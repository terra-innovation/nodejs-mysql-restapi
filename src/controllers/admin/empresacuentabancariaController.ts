import * as empresacuentabancariaDao from "#src/daos/empresacuentabancariaDao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestadoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import { CuentaBancariaAttributes } from "#src/models/ft_factoring/CuentaBancaria";
import { EmpresaCuentaBancariaAttributes } from "#src/models/ft_factoring/EmpresaCuentaBancaria";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";

export const activateEmpresacuentabancaria = async (req, res) => {
  log.debug(line(), "controller::activateEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentaBancariaActivate: Partial<CuentaBancariaAttributes> = {};
    camposCuentaBancariaActivate.cuentabancariaid = cuentabancaria.cuentabancariaid;
    camposCuentaBancariaActivate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaActivate.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaActivate.estado = 1;

    const camposCuentaBancariaActivated = await cuentabancariaDao.deleteCuentabancaria(transaction, { ...camposCuentaBancariaActivate });
    log.debug(line(), "camposCuentaBancariaActivated:", camposCuentaBancariaActivated);

    await transaction.commit();
    response(res, 204, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteEmpresacuentabancaria = async (req, res) => {
  log.debug(line(), "controller::deleteEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentaBancariaDelete: Partial<CuentaBancariaAttributes> = {};
    camposCuentaBancariaDelete.cuentabancariaid = cuentabancaria.cuentabancariaid;
    camposCuentaBancariaDelete.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaDelete.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaDelete.estado = 2;

    const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(transaction, { ...camposCuentaBancariaDelete });
    log.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);

    await transaction.commit();
    response(res, 204, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresacuentabancariaMaster = async (req, res) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const empresas = await empresaDao.getEmpresas(transaction, filter_estados);

    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);
    const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(transaction, filter_estados);

    var cuentasbancariasMaster: Record<string, any> = {};
    cuentasbancariasMaster.empresas = empresas;
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
    await transaction.commit();
    response(res, 201, cuentasbancariasMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req, res) => {
  log.debug(line(), "controller::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado");
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
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(transaction, empresacuentabancariaValidated.cuentabancariaestadoid);
    if (!empresacuentabancariaestado) {
      log.warn(line(), "Cuenta bancaria estado no existe: [" + empresacuentabancariaValidated.cuentabancariaestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);
    if (!cuentabancaria) {
      log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria._idcuentabancaria + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposCuentabancariaFk: Partial<CuentaBancariaAttributes> = {};
    camposCuentabancariaFk._idcuentabancariaestado = empresacuentabancariaestado._idcuentabancariaestado;

    var camposCuentabancariaAdicionales: Partial<CuentaBancariaAttributes> = {};
    camposCuentabancariaAdicionales.cuentabancariaid = cuentabancaria.cuentabancariaid;

    var camposCuentabancariaAuditoria: Partial<CuentaBancariaAttributes> = {};
    camposCuentabancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentabancariaAuditoria.fechamod = Sequelize.fn("now", 3);

    const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposCuentabancariaFk,
      ...camposCuentabancariaAdicionales,
      ...empresacuentabancariaValidated,
      ...camposCuentabancariaAuditoria,
    });
    log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresacuentabancarias = async (req, res) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");
  //log.info(line(),req.session_user.usuario._idusuario);
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const cuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancarias(transaction, filter_estado);
    var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);

    await transaction.commit();
    response(res, 201, cuentasbancariasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createEmpresacuentabancaria = async (req, res) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
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
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, empresacuentabancariaValidated.empresaid);
    if (!empresa) {
      log.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, empresacuentabancariaValidated.bancoid);
    if (!banco) {
      log.warn(line(), "Banco no existe: [" + empresacuentabancariaValidated.bancoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, empresacuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      log.warn(line(), "Cuenta tipo no existe: [" + empresacuentabancariaValidated.cuentatipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, empresacuentabancariaValidated.monedaid);
    if (!moneda) {
      log.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, empresacuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      log.warn(line(), "El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
      throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(transaction, empresa._idempresa, empresacuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      log.warn(line(), "El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
      throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
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
    log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

    var camposEmpresaCuentaBancariaCreate: Partial<EmpresaCuentaBancariaAttributes> = {};
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
    log.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

    const empresacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposEmpresaCuentaBancariaCreate);

    await transaction.commit();
    response(res, 201, { ...empresacuentabancariaFiltered });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
