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

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activateCuentabancaria = async (req, res) => {
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaSchema.validateSync({ cuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const cuentabancariaDeleted = await cuentabancariaDao.activateCuentabancaria(req, { ...cuentabancariaValidated, ...camposAuditoria });
  if (cuentabancariaDeleted[0] === 0) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  logger.debug(line(), "cuentabancariaActivated:", cuentabancariaDeleted);
  response(res, 204, cuentabancariaDeleted);
};

export const deleteCuentabancaria = async (req, res) => {
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaSchema.validateSync({ cuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(req, { ...cuentabancariaValidated, ...camposAuditoria });
  if (cuentabancariaDeleted[0] === 0) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  logger.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);
  response(res, 204, cuentabancariaDeleted);
};

export const getCuentabancariaMaster = async (req, res) => {
  const filter_estados = [1];
  const empresas = await empresaDao.getEmpresas(req, filter_estados);

  const bancos = await bancoDao.getBancos(req, filter_estados);
  const monedas = await monedaDao.getMonedas(req, filter_estados);
  const cuentatipos = await cuentatipoDao.getCuentatipos(req, filter_estados);
  const cuentabancariaestados = await cuentabancariaestadoDao.getCuentaBancariaEstados(req, filter_estados);

  var cuentasbancariasMaster = {};
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
  response(res, 201, cuentasbancariasMasterFiltered);
};

export const updateCuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req, res) => {
  const { id } = req.params;
  const cuentabancariaUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaUpdateSchema.validateSync({ cuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaValidated:", cuentabancariaValidated);

  var cuentabancariaestado = await cuentabancariaestadoDao.findCuentaBancariaEstadoPk(req, cuentabancariaValidated.cuentabancariaestadoid);
  if (!cuentabancariaestado) {
    throw new ClientError("Cuenta bancaria tipo no existe", 404);
  }

  var camposFk = {};
  camposFk._idcuentabancariaestado = cuentabancariaestado._idcuentabancariaestado;

  var camposAdicionales = {};
  camposAdicionales.cuentabancariaid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await cuentabancariaDao.updateCuentabancaria(req, {
    ...camposFk,
    ...camposAdicionales,
    ...cuentabancariaValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  logger.info(line(), id);
  const cuentabancariaUpdated = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(req, id);
  if (!cuentabancariaUpdated) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }

  var cuentabancariaObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var cuentabancariaFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaObfuscated);
  response(res, 200, cuentabancariaFiltered);
};

export const getCuentabancarias = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estado = [1, 2];
  const cuentasbancarias = await cuentabancariaDao.getCuentasbancarias(req, filter_estado);
  var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);
  //logger.info(line(),empresaObfuscated);

  //var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasJson, ["score"]);
  //cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
  response(res, 201, cuentasbancariasJson);
};

export const createCuentabancaria = async (req, res) => {
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

  var empresa = await empresaDao.findEmpresaPk(req, cuentabancariaValidated.empresaid);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }

  var banco = await bancoDao.findBancoPk(req, cuentabancariaValidated.bancoid);
  if (!banco) {
    throw new ClientError("Banco no existe", 404);
  }

  var cuentatipo = await cuentatipoDao.findCuentatipoPk(req, cuentabancariaValidated.cuentatipoid);
  if (!cuentatipo) {
    throw new ClientError("Cuenta tipo no existe", 404);
  }

  var moneda = await monedaDao.findMonedaPk(req, cuentabancariaValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(req, banco._idbanco, cuentabancariaValidated.numero, filter_estado);
  if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
    throw new ClientError("El número de cuenta [" + cuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
  }

  var cuentasbancarias_por_alias = await cuentabancariaDao.getCuentasbancariasByIdusuarioAndAlias(req, session_idusuario, cuentabancariaValidated.alias, filter_estado);
  if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
    throw new ClientError("El alias [" + cuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
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

  const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(req, {
    ...camposFk,
    ...camposAdicionales,
    ...cuentabancariaValidated,
    ...camposAuditoria,
  });
  //logger.debug(line(),"Create cuentabancaria: ID:" + cuentabancariaCreated._idcuentabancaria + " | " + camposAdicionales.cuentabancariaid);
  //logger.debug(line(),"cuentabancariaCreated:", cuentabancariaCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...cuentabancariaValidated });
};
