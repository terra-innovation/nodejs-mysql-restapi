import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as empresacuentabancariaDao from "../../daos/empresacuentabancariaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getCuentabancariaMaster = async (req, res) => {
  logger.debug(line(), "controller::getCuentabancariaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const session_idusuario = req.session_user.usuario._idusuario;
    //logger.info(line(),req.session_user.usuario.rol_rols);
    const roles = [2]; // Administrador
    const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
    const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

    const empresas = await empresaDao.getEmpresasByIdusuario(transaction, session_idusuario, filter_estados);

    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);

    var cuentasbancariasMaster = {};
    cuentasbancariasMaster.empresas = empresas;
    cuentasbancariasMaster.bancos = bancos;
    cuentasbancariasMaster.monedas = monedas;
    cuentasbancariasMaster.cuentatipos = cuentatipos;

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

export const updateCuentabancariaOnlyAlias = async (req, res) => {
  logger.debug(line(), "controller::updateCuentabancariaOnlyAlias");
  const { id } = req.params;
  const cuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaUpdateSchema.validateSync({ cuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const _idusuario_session = req.session_user.usuario._idusuario;
    const cuentabancaria = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(transaction, cuentabancariaValidated.cuentabancariaid);
    if (!cuentabancaria) {
      logger.warn(line(), "Cuenta bancaria no existe: [" + cuentabancariaValidated.cuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresa = await empresaDao.getEmpresaByEmpresaid(transaction, cuentabancariaValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + cuentabancariaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentabancariaAllowed = await cuentabancariaDao.getCuentabancariaByIdcuentabancariaIdempresaIdusuario(transaction, cuentabancaria._idcuentabancaria, empresa._idempresa, _idusuario_session);
    if (!cuentabancariaAllowed) {
      logger.warn(line(), "Cuenta bancaria no permitida: [" + cuentabancaria._idcuentabancaria + ", " + empresa._idempresa + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposAdicionales = {};
    camposAdicionales.cuentabancariaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposAdicionales,
      ...cuentabancariaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCuentabancarias = async (req, res) => {
  logger.debug(line(), "controller::getCuentabancarias");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const cuentasbancarias = await cuentabancariaDao.getCuentasbancariasByIdusuario(transaction, session_idusuario, filter_estado);
    var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);
    //logger.info(line(),empresaObfuscated);

    var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasJson, ["score"]);
    cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
    await transaction.commit();
    response(res, 201, cuentasbancariasFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createCuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::createCuentabancaria");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
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

    var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, session_idusuario, cuentabancariaValidated.empresaid, filter_estado);
    if (!empresa_por_idusuario) {
      throw new ClientError("Empresa no asociada al usuario", 404);
    }

    var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, cuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      throw new ClientError("El número de cuenta [" + cuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await cuentabancariaDao.getCuentasbancariasByIdusuarioAndAlias(transaction, session_idusuario, cuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      throw new ClientError("El alias [" + cuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
    }
    var camposCuentaBancariaFk = {};
    camposCuentaBancariaFk._idempresa = empresa._idempresa;
    camposCuentaBancariaFk._idbanco = banco._idbanco;
    camposCuentaBancariaFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposCuentaBancariaFk._idmoneda = moneda._idmoneda;
    camposCuentaBancariaFk._idcuentabancariaestado = 1; // Por defecto

    var camposCuentaBancariaAdicionales = {};
    camposCuentaBancariaAdicionales.cuentabancariaid = uuidv4();

    var camposCuentaBancariaAuditoria = {};
    camposCuentaBancariaAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposCuentaBancariaFk,
      ...camposCuentaBancariaAdicionales,
      ...cuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

    var camposEmpresaCuentaBancariaCreate = {};
    camposEmpresaCuentaBancariaCreate._idempresa = empresa_por_idusuario._idempresa;
    camposEmpresaCuentaBancariaCreate._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;
    camposEmpresaCuentaBancariaCreate.fechacrea = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposEmpresaCuentaBancariaCreate.fechamod = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.estado = 1;

    const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(transaction, camposEmpresaCuentaBancariaCreate);
    logger.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

    // Retiramos los IDs internos
    delete camposCuentaBancariaAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposCuentaBancariaAdicionales, ...cuentabancariaValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
