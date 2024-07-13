import * as cuentabancariaDao from "../daos/cuentabancariaDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getCuentasbancarias = async (req, res) => {
  const cuentasbancarias = await cuentabancariaDao.getCuentasbancariasActivas(req);
  var cuentasbancariasObfuscated = jsonUtils.ofuscarAtributos(cuentasbancarias, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasObfuscated);
  response(res, 201, cuentasbancariasFiltered);
};


export const getCuentasbancariasEmpresario = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);

  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const cuentasbancarias = await cuentabancariaDao.getCuentasbancariasByIdusuario(req, session_idusuario, filter_estado);
  var cuentasbancariasJson= jsonUtils.sequelizeToJSON(cuentasbancarias);
  //console.log(empresaObfuscated);

  var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasJson, ["score"]);
  cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
  response(res, 201, cuentasbancariasFiltered);
};

export const getCuentasbancariasMiosByEmpresaidActivos = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var cuentabancariaValidated = cuentabancariaSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(req, req.session_user.usuario._idusuario, cuentabancariaValidated.empresaid, 1);
  //console.log(empresa);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }
  const filter_empresaid = cuentabancariaValidated.empresaid;
  const filter_monedaid = cuentabancariaValidated.monedaid;
  const filter_idcuentabancariaestado = [2];
  const filter_estado = [1, 2];
  const cuentasbancarias = await cuentabancariaDao.getCuentasbancariasByEmpresaidAndMoneda(req, filter_empresaid, filter_monedaid, filter_idcuentabancariaestado, filter_estado);
  var cuentasbancariasObfuscated = jsonUtils.ofuscarAtributos(cuentasbancarias, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasObfuscated, ["score"]);
  cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
  response(res, 201, cuentasbancariasFiltered);
};

export const getCuentabancaria = async (req, res) => {
  const { id } = req.params;
  const cuentabancariaSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var cuentabancariaValidated = cuentabancariaSchema.validateSync({ cuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  const cuentabancaria = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(req, cuentabancariaValidated.cuentabancariaid);
  if (!cuentabancaria) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  var cuentabancariaObfuscated = jsonUtils.ofuscarAtributos(cuentabancaria, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var cuentabancariaFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaObfuscated);
  response(res, 200, cuentabancariaFiltered);
};

export const createCuentabancaria = async (req, res) => {
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
  console.debug("cuentabancariaValidated:", cuentabancariaValidated);

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

  const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(req, { ...camposFk, ...camposAdicionales, ...cuentabancariaValidated, ...camposAuditoria });
  console.debug("Create cuentabancaria: ID:" + cuentabancariaCreated.idcuentabancaria + " | " + camposAdicionales.cuentabancariaid);
  console.debug("cuentabancariaCreated:", cuentabancariaCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...cuentabancariaValidated });
};

export const updateCuentabancaria = async (req, res) => {
  const { id } = req.params;
  const cuentabancariaUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const cuentabancariaValidated = cuentabancariaUpdateSchema.validateSync({ cuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("cuentabancariaValidated:", cuentabancariaValidated);

  var camposAdicionales = {};
  camposAdicionales.cuentabancariaid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await cuentabancariaDao.updateCuentabancaria(req, { ...camposAdicionales, ...cuentabancariaValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  console.log(id);
  const cuentabancariaUpdated = await cuentabancariaDao.getCuentabancariaByCuentabancariaid(req, id);
  if (!cuentabancariaUpdated) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }

  var cuentabancariaObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var cuentabancariaFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaObfuscated);
  response(res, 200, cuentabancariaFiltered);
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
  console.debug("cuentabancariaValidated:", cuentabancariaValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(req, { ...cuentabancariaValidated, ...camposAuditoria });
  if (cuentabancariaDeleted[0] === 0) {
    throw new ClientError("Cuentabancaria no existe", 404);
  }
  console.debug("cuentabancariaDeleted:", cuentabancariaDeleted);
  response(res, 204, cuentabancariaDeleted);
};
