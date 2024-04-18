import * as riesgoDao from "../daos/riesgoDao.js";
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

export const getRiesgos = async (req, res) => {
  const filter_estados = [1];
  const riesgos = await riesgoDao.getRiesgos(req, filter_estados);
  var riesgosJSON = jsonUtils.sequelizeToJSON(riesgos);
  //jsonUtils.prettyPrint(riesgosJSON);
  var riesgosObfuscated = riesgosJSON;
  //jsonUtils.prettyPrint(riesgosObfuscated);
  var riesgosFiltered = jsonUtils.removeAttributesPrivates(riesgosObfuscated);
  response(res, 201, riesgosFiltered);
};

export const getRiesgosMiosByEmpresaidActivos = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);
  const { id } = req.params;
  const riesgoSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var riesgoValidated = riesgoSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(req, req.session_user.usuario._idusuario, riesgoValidated.empresaid, 1);
  //console.log(empresa);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }
  const filter_empresaid = riesgoValidated.empresaid;
  const filter_monedaid = riesgoValidated.monedaid;
  const filter_idriesgoestado = [2];
  const filter_estado = [1, 2];
  const riesgos = await riesgoDao.getRiesgosByEmpresaidAndMoneda(req, filter_empresaid, filter_monedaid, filter_idriesgoestado, filter_estado);
  var riesgosObfuscated = jsonUtils.ofuscarAtributos(riesgos, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var riesgosFiltered = jsonUtils.removeAttributes(riesgosObfuscated, ["score"]);
  riesgosFiltered = jsonUtils.removeAttributesPrivates(riesgosFiltered);
  response(res, 201, riesgosFiltered);
};

export const getRiesgo = async (req, res) => {
  const { id } = req.params;
  const riesgoSchema = yup
    .object()
    .shape({
      riesgoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var riesgoValidated = riesgoSchema.validateSync({ riesgoid: id }, { abortEarly: false, stripUnknown: true });
  const riesgo = await riesgoDao.getRiesgoByRiesgoid(req, riesgoValidated.riesgoid);
  if (!riesgo) {
    throw new ClientError("Riesgo no existe", 404);
  }
  var riesgoObfuscated = jsonUtils.ofuscarAtributos(riesgo, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var riesgoFiltered = jsonUtils.removeAttributesPrivates(riesgoObfuscated);
  response(res, 200, riesgoFiltered);
};

export const createRiesgo = async (req, res) => {
  const riesgoCreateSchema = yup
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
  var riesgoValidated = riesgoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  console.debug("riesgoValidated:", riesgoValidated);

  var empresa = await empresaDao.findEmpresaPk(req, riesgoValidated.empresaid);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }

  var banco = await bancoDao.findBancoPk(req, riesgoValidated.bancoid);
  if (!banco) {
    throw new ClientError("Banco no existe", 404);
  }

  var cuentatipo = await cuentatipoDao.findCuentatipoPk(req, riesgoValidated.cuentatipoid);
  if (!cuentatipo) {
    throw new ClientError("Cuenta tipo no existe", 404);
  }
  var moneda = await monedaDao.findMonedaPk(req, riesgoValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idempresa = empresa._idempresa;
  camposFk._idbanco = banco._idbanco;
  camposFk._idcuentatipo = cuentatipo._idcuentatipo;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idriesgoestado = 1; // Por defecto

  var camposAdicionales = {};
  camposAdicionales.riesgoid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const riesgoCreated = await riesgoDao.insertRiesgo(req, { ...camposFk, ...camposAdicionales, ...riesgoValidated, ...camposAuditoria });
  console.debug("Create riesgo: ID:" + riesgoCreated.idriesgo + " | " + camposAdicionales.riesgoid);
  console.debug("riesgoCreated:", riesgoCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...riesgoValidated });
};

export const updateRiesgo = async (req, res) => {
  const { id } = req.params;
  const riesgoUpdateSchema = yup
    .object()
    .shape({
      riesgoid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const riesgoValidated = riesgoUpdateSchema.validateSync({ riesgoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("riesgoValidated:", riesgoValidated);

  var camposAdicionales = {};
  camposAdicionales.riesgoid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await riesgoDao.updateRiesgo(req, { ...camposAdicionales, ...riesgoValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Riesgo no existe", 404);
  }
  console.log(id);
  const riesgoUpdated = await riesgoDao.getRiesgoByRiesgoid(req, id);
  if (!riesgoUpdated) {
    throw new ClientError("Riesgo no existe", 404);
  }

  var riesgoObfuscated = jsonUtils.ofuscarAtributos(riesgoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var riesgoFiltered = jsonUtils.removeAttributesPrivates(riesgoObfuscated);
  response(res, 200, riesgoFiltered);
};

export const deleteRiesgo = async (req, res) => {
  const { id } = req.params;
  const riesgoSchema = yup
    .object()
    .shape({
      riesgoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const riesgoValidated = riesgoSchema.validateSync({ riesgoid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("riesgoValidated:", riesgoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const riesgoDeleted = await riesgoDao.deleteRiesgo(req, { ...riesgoValidated, ...camposAuditoria });
  if (riesgoDeleted[0] === 0) {
    throw new ClientError("Riesgo no existe", 404);
  }
  console.debug("riesgoDeleted:", riesgoDeleted);
  response(res, 204, riesgoDeleted);
};
