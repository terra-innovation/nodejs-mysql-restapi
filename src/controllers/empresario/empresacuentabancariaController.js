import * as empresacuentabancariaDao from "../../daos/empresacuentabancariaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
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

export const getEmpresacuentabancariaMaster = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancariaMaster");
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

export const updateEmpresacuentabancariaOnlyAlias = async (req, res) => {
  logger.debug(line(), "controller::updateEmpresacuentabancariaOnlyAlias");
  const { id } = req.params;
  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ empresacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const _idusuario_session = req.session_user.usuario._idusuario;
    const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      logger.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresa = await empresaDao.getEmpresaByEmpresaid(transaction, empresacuentabancariaValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresacuentabancariaAllowed = await empresacuentabancariaDao.getEmpresacuentabancariaByIdempresacuentabancariaIdempresaIdusuario(transaction, empresacuentabancaria._idempresacuentabancaria, empresa._idempresa, _idusuario_session);
    if (!empresacuentabancariaAllowed) {
      logger.warn(line(), "Cuenta bancaria no permitida: [" + empresacuentabancaria._idempresacuentabancaria + ", " + empresa._idempresa + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposAdicionales = {};
    camposAdicionales.empresacuentabancariaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const empresacuentabancariaUpdated = await empresacuentabancariaDao.updateEmpresacuentabancaria(transaction, {
      ...camposAdicionales,
      ...empresacuentabancariaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "empresacuentabancariaUpdated", empresacuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getEmpresacuentabancarias = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancarias");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdusuario(transaction, session_idusuario, filter_estado);
    var empresacuentabancariasJson = jsonUtils.sequelizeToJSON(empresacuentabancarias);
    //logger.info(line(),empresaObfuscated);

    var empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancariasJson, ["score"]);
    empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
    await transaction.commit();
    response(res, 201, empresacuentabancariasFiltered);
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
      throw new ClientError("Empresa no existe", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, empresacuentabancariaValidated.bancoid);
    if (!banco) {
      throw new ClientError("Banco no existe", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, empresacuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      throw new ClientError("Cuenta tipo no existe", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, empresacuentabancariaValidated.monedaid);
    if (!moneda) {
      throw new ClientError("Moneda no existe", 404);
    }

    var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, session_idusuario, empresacuentabancariaValidated.empresaid, filter_estado);
    if (!empresa_por_idusuario) {
      throw new ClientError("Empresa no asociada al usuario", 404);
    }

    var cuentasbancarias_por_numero = await empresacuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, empresacuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await empresacuentabancariaDao.getCuentasbancariasByIdusuarioAndAlias(transaction, session_idusuario, empresacuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
    }
    var camposCuentaBancariaFk = {};
    camposCuentaBancariaFk._idempresa = empresa._idempresa;
    camposCuentaBancariaFk._idbanco = banco._idbanco;
    camposCuentaBancariaFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposCuentaBancariaFk._idmoneda = moneda._idmoneda;
    camposCuentaBancariaFk._idempresacuentabancariaestado = 1; // Por defecto

    var camposCuentaBancariaAdicionales = {};
    camposCuentaBancariaAdicionales.empresacuentabancariaid = uuidv4();

    var camposCuentaBancariaAuditoria = {};
    camposCuentaBancariaAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertEmpresacuentabancaria(transaction, {
      ...camposCuentaBancariaFk,
      ...camposCuentaBancariaAdicionales,
      ...empresacuentabancariaValidated,
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
    response(res, 201, { ...camposCuentaBancariaAdicionales, ...empresacuentabancariaValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
