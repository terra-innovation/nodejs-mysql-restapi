import * as factoringestadoDao from "../daos/factoringestadoDao.js";
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

export const getFactoringestados = async (req, res) => {
  const filter_estados = [1];
  const factoringestados = await factoringestadoDao.getFactoringestados(req, filter_estados);
  var factoringestadosJSON = jsonUtils.sequelizeToJSON(factoringestados);
  //jsonUtils.prettyPrint(factoringestadosJSON);
  var factoringestadosObfuscated = factoringestadosJSON;
  //jsonUtils.prettyPrint(factoringestadosObfuscated);
  var factoringestadosFiltered = jsonUtils.removeAttributesPrivates(factoringestadosObfuscated);
  response(res, 201, factoringestadosFiltered);
};

export const getFactoringestadosMiosByEmpresaidActivos = async (req, res) => {
  //console.log(req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringestadoValidated = factoringestadoSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(req, req.session_user.usuario._idusuario, factoringestadoValidated.empresaid, 1);
  //console.log(empresa);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }
  const filter_empresaid = factoringestadoValidated.empresaid;
  const filter_monedaid = factoringestadoValidated.monedaid;
  const filter_idfactoringestadoestado = [2];
  const filter_estado = [1, 2];
  const factoringestados = await factoringestadoDao.getFactoringestadosByEmpresaidAndMoneda(req, filter_empresaid, filter_monedaid, filter_idfactoringestadoestado, filter_estado);
  var factoringestadosObfuscated = jsonUtils.ofuscarAtributos(factoringestados, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringestadosFiltered = jsonUtils.removeAttributes(factoringestadosObfuscated, ["score"]);
  factoringestadosFiltered = jsonUtils.removeAttributesPrivates(factoringestadosFiltered);
  response(res, 201, factoringestadosFiltered);
};

export const getFactoringestado = async (req, res) => {
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringestadoValidated = factoringestadoSchema.validateSync({ factoringestadoid: id }, { abortEarly: false, stripUnknown: true });
  const factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(req, factoringestadoValidated.factoringestadoid);
  if (!factoringestado) {
    throw new ClientError("Factoringestado no existe", 404);
  }
  var factoringestadoObfuscated = jsonUtils.ofuscarAtributos(factoringestado, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringestadoFiltered = jsonUtils.removeAttributesPrivates(factoringestadoObfuscated);
  response(res, 200, factoringestadoFiltered);
};

export const createFactoringestado = async (req, res) => {
  const factoringestadoCreateSchema = yup
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
  var factoringestadoValidated = factoringestadoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  console.debug("factoringestadoValidated:", factoringestadoValidated);

  var empresa = await empresaDao.findEmpresaPk(req, factoringestadoValidated.empresaid);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }

  var banco = await bancoDao.findBancoPk(req, factoringestadoValidated.bancoid);
  if (!banco) {
    throw new ClientError("Banco no existe", 404);
  }

  var cuentatipo = await cuentatipoDao.findCuentatipoPk(req, factoringestadoValidated.cuentatipoid);
  if (!cuentatipo) {
    throw new ClientError("Cuenta tipo no existe", 404);
  }
  var moneda = await monedaDao.findMonedaPk(req, factoringestadoValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idempresa = empresa._idempresa;
  camposFk._idbanco = banco._idbanco;
  camposFk._idcuentatipo = cuentatipo._idcuentatipo;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idfactoringestadoestado = 1; // Por defecto

  var camposAdicionales = {};
  camposAdicionales.factoringestadoid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const factoringestadoCreated = await factoringestadoDao.insertFactoringestado(req, { ...camposFk, ...camposAdicionales, ...factoringestadoValidated, ...camposAuditoria });
  console.debug("Create factoringestado: ID:" + factoringestadoCreated.idfactoringestado + " | " + camposAdicionales.factoringestadoid);
  console.debug("factoringestadoCreated:", factoringestadoCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...factoringestadoValidated });
};

export const updateFactoringestado = async (req, res) => {
  const { id } = req.params;
  const factoringestadoUpdateSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const factoringestadoValidated = factoringestadoUpdateSchema.validateSync({ factoringestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringestadoValidated:", factoringestadoValidated);

  var camposAdicionales = {};
  camposAdicionales.factoringestadoid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await factoringestadoDao.updateFactoringestado(req, { ...camposAdicionales, ...factoringestadoValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Factoringestado no existe", 404);
  }
  console.log(id);
  const factoringestadoUpdated = await factoringestadoDao.getFactoringestadoByFactoringestadoid(req, id);
  if (!factoringestadoUpdated) {
    throw new ClientError("Factoringestado no existe", 404);
  }

  var factoringestadoObfuscated = jsonUtils.ofuscarAtributos(factoringestadoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //console.log(empresaObfuscated);

  var factoringestadoFiltered = jsonUtils.removeAttributesPrivates(factoringestadoObfuscated);
  response(res, 200, factoringestadoFiltered);
};

export const deleteFactoringestado = async (req, res) => {
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringestadoValidated = factoringestadoSchema.validateSync({ factoringestadoid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringestadoValidated:", factoringestadoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const factoringestadoDeleted = await factoringestadoDao.deleteFactoringestado(req, { ...factoringestadoValidated, ...camposAuditoria });
  if (factoringestadoDeleted[0] === 0) {
    throw new ClientError("Factoringestado no existe", 404);
  }
  console.debug("factoringestadoDeleted:", factoringestadoDeleted);
  response(res, 204, factoringestadoDeleted);
};
