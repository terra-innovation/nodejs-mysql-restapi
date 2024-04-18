import * as factoringtipoDao from "../daos/factoringtipoDao.js";
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

export const getFactoringtipos = async (req, res) => {
  const filter_estados = [1];
  const factoringtipos = await factoringtipoDao.getFactoringtipos(req, filter_estados);
  var factoringtiposJSON = jsonUtils.sequelizeToJSON(factoringtipos);
  //jsonUtils.prettyPrint(factoringtiposJSON);
  var factoringtiposObfuscated = factoringtiposJSON;
  //jsonUtils.prettyPrint(factoringtiposObfuscated);
  var factoringtiposFiltered = jsonUtils.removeAttributesPrivates(factoringtiposObfuscated);
  response(res, 201, factoringtiposFiltered);
};

export const getFactoringtiposMiosByEmpresaidActivos = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringtipoValidated = factoringtipoSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(req, req.session_user.usuario._idusuario, factoringtipoValidated.empresaid, 1);
  //console.log(empresa);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }
  const filter_empresaid = factoringtipoValidated.empresaid;
  const filter_monedaid = factoringtipoValidated.monedaid;
  const filter_idfactoringtipoestado = [2];
  const filter_estado = [1, 2];
  const factoringtipos = await factoringtipoDao.getFactoringtiposByEmpresaidAndMoneda(req, filter_empresaid, filter_monedaid, filter_idfactoringtipoestado, filter_estado);
  var factoringtiposObfuscated = jsonUtils.ofuscarAtributos(factoringtipos, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringtiposFiltered = jsonUtils.removeAttributes(factoringtiposObfuscated, ["score"]);
  factoringtiposFiltered = jsonUtils.removeAttributesPrivates(factoringtiposFiltered);
  response(res, 201, factoringtiposFiltered);
};

export const getFactoringtipo = async (req, res) => {
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringtipoValidated = factoringtipoSchema.validateSync({ factoringtipoid: id }, { abortEarly: false, stripUnknown: true });
  const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(req, factoringtipoValidated.factoringtipoid);
  if (!factoringtipo) {
    throw new ClientError("Factoringtipo no existe", 404);
  }
  var factoringtipoObfuscated = jsonUtils.ofuscarAtributos(factoringtipo, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringtipoFiltered = jsonUtils.removeAttributesPrivates(factoringtipoObfuscated);
  response(res, 200, factoringtipoFiltered);
};

export const createFactoringtipo = async (req, res) => {
  const factoringtipoCreateSchema = yup
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
  var factoringtipoValidated = factoringtipoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  console.debug("factoringtipoValidated:", factoringtipoValidated);

  var empresa = await empresaDao.findEmpresaPk(req, factoringtipoValidated.empresaid);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }

  var banco = await bancoDao.findBancoPk(req, factoringtipoValidated.bancoid);
  if (!banco) {
    throw new ClientError("Banco no existe", 404);
  }

  var cuentatipo = await cuentatipoDao.findCuentatipoPk(req, factoringtipoValidated.cuentatipoid);
  if (!cuentatipo) {
    throw new ClientError("Cuenta tipo no existe", 404);
  }
  var moneda = await monedaDao.findMonedaPk(req, factoringtipoValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idempresa = empresa._idempresa;
  camposFk._idbanco = banco._idbanco;
  camposFk._idcuentatipo = cuentatipo._idcuentatipo;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idfactoringtipoestado = 1; // Por defecto

  var camposAdicionales = {};
  camposAdicionales.factoringtipoid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const factoringtipoCreated = await factoringtipoDao.insertFactoringtipo(req, { ...camposFk, ...camposAdicionales, ...factoringtipoValidated, ...camposAuditoria });
  console.debug("Create factoringtipo: ID:" + factoringtipoCreated.idfactoringtipo + " | " + camposAdicionales.factoringtipoid);
  console.debug("factoringtipoCreated:", factoringtipoCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...factoringtipoValidated });
};

export const updateFactoringtipo = async (req, res) => {
  const { id } = req.params;
  const factoringtipoUpdateSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const factoringtipoValidated = factoringtipoUpdateSchema.validateSync({ factoringtipoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringtipoValidated:", factoringtipoValidated);

  var camposAdicionales = {};
  camposAdicionales.factoringtipoid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await factoringtipoDao.updateFactoringtipo(req, { ...camposAdicionales, ...factoringtipoValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Factoringtipo no existe", 404);
  }
  console.log(id);
  const factoringtipoUpdated = await factoringtipoDao.getFactoringtipoByFactoringtipoid(req, id);
  if (!factoringtipoUpdated) {
    throw new ClientError("Factoringtipo no existe", 404);
  }

  var factoringtipoObfuscated = jsonUtils.ofuscarAtributos(factoringtipoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringtipoFiltered = jsonUtils.removeAttributesPrivates(factoringtipoObfuscated);
  response(res, 200, factoringtipoFiltered);
};

export const deleteFactoringtipo = async (req, res) => {
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtipoValidated = factoringtipoSchema.validateSync({ factoringtipoid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringtipoValidated:", factoringtipoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const factoringtipoDeleted = await factoringtipoDao.deleteFactoringtipo(req, { ...factoringtipoValidated, ...camposAuditoria });
  if (factoringtipoDeleted[0] === 0) {
    throw new ClientError("Factoringtipo no existe", 404);
  }
  console.debug("factoringtipoDeleted:", factoringtipoDeleted);
  response(res, 204, factoringtipoDeleted);
};
