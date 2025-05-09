import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as archivocuentabancariaDao from "#src/daos/archivocuentabancariaDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as inversionistacuentabancariaDao from "#src/daos/inversionistacuentabancariaDao.js";
import * as inversionistaDao from "#src/daos/inversionistaDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";

import * as fs from "fs";
import path from "path";
import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import * as storageUtils from "#src/utils/storageUtils.js";

export const createInversionistacuentabancaria = async (req, res) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const _idusuario_session = req.session_user.usuario._idusuario;
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
  var inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var inversionista = await inversionistaDao.getInversionistaByInversionistaid(transaction, inversionistacuentabancariaValidated.inversionistaid);
    if (!inversionista) {
      log.warn(line(), "Inversionista no existe: [" + inversionistacuentabancariaValidated.inversionistaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var banco = await bancoDao.getBancoByBancoid(transaction, inversionistacuentabancariaValidated.bancoid);
    if (!banco) {
      log.warn(line(), "Banco no existe: [" + inversionistacuentabancariaValidated.bancoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentatipo = await cuentatipoDao.getCuentatipoByCuentatipoid(transaction, inversionistacuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      log.warn(line(), "Cuenta tipo no existe: [" + inversionistacuentabancariaValidated.cuentatipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var moneda = await monedaDao.getMonedaByMonedaid(transaction, inversionistacuentabancariaValidated.monedaid);
    if (!moneda) {
      log.warn(line(), "Moneda no existe: [" + inversionistacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const inversionistacuentabancariaAllowed = await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(transaction, inversionista._idinversionista, _idusuario_session, filter_estado);
    if (!inversionistacuentabancariaAllowed) {
      log.warn(line(), "Inversionista no asociado al usuario: [" + inversionista._idinversionista + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, inversionistacuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      log.warn(line(), "El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
      throw new ClientError("El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(transaction, inversionista._idinversionista, inversionistacuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      log.warn(line(), "El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
      throw new ClientError("El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
    }

    var camposCuentaBancariaFk = {
      _idinversionista: inversionista._idinversionista,
      _idbanco: banco._idbanco,
      _idcuentatipo: cuentatipo._idcuentatipo,
      _idmoneda: moneda._idmoneda,
      _idcuentabancariaestado: 1, // Por defecto
    };

    var camposCuentaBancariaAdicionales = {
      cuentabancariaid: uuidv4(),
      code: uuidv4().split("-")[0],
    };

    var camposCuentaBancariaAuditoria = {
      idusuariocrea: req.session_user.usuario._idusuario ?? 1,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    };

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposCuentaBancariaFk,
      ...camposCuentaBancariaAdicionales,
      ...inversionistacuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated.dataValues);

    var camposEmpresaCuentaBancariaCreate = {
      _idinversionista: inversionista._idinversionista,
      _idcuentabancaria: cuentabancariaCreated._idcuentabancaria,
      inversionistacuentabancariaid: uuidv4(),
      code: uuidv4().split("-")[0],
      idusuariocrea: req.session_user.usuario._idusuario ?? 1,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    };

    const inversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(transaction, camposEmpresaCuentaBancariaCreate);
    log.debug(line(), "inversionistacuentabancariaCreated:", inversionistacuentabancariaCreated.dataValues);

    const inversionistacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposEmpresaCuentaBancariaCreate);

    await transaction.commit();
    response(res, 201, { ...inversionistacuentabancariaFiltered });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateInversionistacuentabancariaOnlyAlias = async (req, res) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAlias");
  const { id } = req.params;
  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync({ inversionistacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const _idusuario_session = req.session_user.usuario._idusuario;
    const inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(transaction, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
    if (!inversionistacuentabancaria) {
      log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const inversionistacuentabancariaAllowed = await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(transaction, inversionistacuentabancaria._idinversionista, _idusuario_session, filter_estado);
    if (!inversionistacuentabancariaAllowed) {
      log.warn(line(), "Inversionista no asociado al usuario: [" + inversionistacuentabancaria._idinversionista + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, inversionistacuentabancaria._idcuentabancaria);

    var camposCuentaBancariaAdicionales = {
      cuentabancariaid: cuentabancaria.cuentabancariaid,
    };

    var camposCuentaBancariaAuditoria = {
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
    };

    const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposCuentaBancariaAdicionales,
      ...inversionistacuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getInversionistacuentabancarias = async (req, res) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const transaction = await sequelizeFT.transaction();
  try {
    //log.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const inversionistacuentabancarias = await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdusuario(transaction, session_idusuario, filter_estado);
    var inversionistacuentabancariasJson = jsonUtils.sequelizeToJSON(inversionistacuentabancarias);
    //log.info(line(),empresaObfuscated);

    var inversionistacuentabancariasFiltered = jsonUtils.removeAttributes(inversionistacuentabancariasJson, ["score"]);
    inversionistacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(inversionistacuentabancariasFiltered);
    await transaction.commit();
    response(res, 201, inversionistacuentabancariasFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getInversionistacuentabancariaMaster = async (req, res) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const session_idusuario = req.session_user.usuario._idusuario;
    //log.info(line(),req.session_user.usuario.rol_rols);
    //const roles = [2]; // Administrador
    //const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
    // const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

    const inversionista = await inversionistaDao.getInversionistaByIdusuario(transaction, session_idusuario, filter_estados);

    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);

    var cuentasbancariasMaster = {
      inversionista: inversionista,
      bancos: bancos,
      monedas: monedas,
      cuentatipos: cuentatipos,
    };

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
