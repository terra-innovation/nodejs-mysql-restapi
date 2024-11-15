import * as empresaDao from "../daos/empresaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";
import logger, { line } from "../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getAceptante = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await empresaDao.getEmpresaByEmpresaid(req, empresaValidated.empresaid);
  if (rows.length <= 0) {
    throw new ClientError("Empresa no existe", 404);
  }

  var empresaObfuscated = jsonUtils.ofuscarAtributos(rows[0], ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
  empresaObfuscated = jsonUtils.ofuscarAtributos(empresaObfuscated, ["nombre"], jsonUtils.PATRON_OFUSCAR_NOMBRE);
  empresaObfuscated = jsonUtils.ofuscarAtributos(empresaObfuscated, ["telefono"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
  //logger.info(line(),empresaObfuscated);

  var empresaFiltered = jsonUtils.removeAttributesPrivates(empresaObfuscated);
  //jsonUtils.prettyPrint(empresaFiltered);
  response(res, 200, empresaFiltered);
};

export const getGirador = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await empresaDao.getEmpresaByEmpresaid(req, empresaValidated.empresaid);
  if (rows.length <= 0) {
    throw new ClientError("Empresa no existe", 404);
  }

  var usuarioOfuscado = jsonUtils.ofuscarAtributos(rows[0], ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
  usuarioOfuscado = jsonUtils.ofuscarAtributos(usuarioOfuscado, ["nombre"], jsonUtils.PATRON_OFUSCAR_NOMBRE);
  usuarioOfuscado = jsonUtils.ofuscarAtributos(usuarioOfuscado, ["telefono"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
  //logger.info(line(),usuarioOfuscado);
  response(res, 200, usuarioOfuscado);
};

export const getEmpresas = async (req, res) => {
  const filter_estados = [1];
  const empresas = await empresaDao.getEmpresas(req, filter_estados);
  response(res, 201, empresas);
};

export const getEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await empresaDao.getEmpresaByEmpresaid(req, empresaValidated.empresaid);
  if (rows.length <= 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  response(res, 200, rows[0]);
};

export const createEmpresa = async (req, res) => {
  const empresaCreateSchema = yup
    .object()
    .shape({
      ruc: yup.string().trim().required().min(11).max(11),
      razon_social: yup.string().required().max(200),
      nombre_comercial: yup.string().max(200),
      fecha_inscripcion: yup.string(),
      domicilio_fiscal: yup.string().max(200),
      score: yup.string().max(5),
    })
    .required();
  var empresaValidated = empresaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);
  var camposAdicionales = {};
  camposAdicionales.empresaid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const empresa_existe = await empresaDao.getEmpresaByRuc(req, empresaValidated.ruc);

  if (empresa_existe.length >= 1) {
    throw new ClientError("Empresa ya existe", 404);
  }
  const empresaCreated = await empresaDao.insertEmpresa(req, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
  logger.debug(line(), "Create empresa: ID:" + empresaCreated.idempresa + " | " + camposAdicionales.empresaid);
  logger.debug(line(), "empresaCreated:", empresaCreated.dataValues);
  response(res, 201, { ...camposAdicionales, ...empresaValidated });
};

export const updateEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),

      ruc: yup.string().trim().required().min(11).max(11),
      razon_social: yup.string().required().max(200),
      nombre_comercial: yup.string().max(200),
      fecha_inscripcion: yup.string(),
      domicilio_fiscal: yup.string().max(200),
      score: yup.string().max(5),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  var camposAdicionales = {};
  camposAdicionales.empresaid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const empresa_por_ruc_existe = await empresaDao.getEmpresaByRuc(req, empresaValidated.ruc);
  if (empresa_por_ruc_existe.length >= 1 && empresa_por_ruc_existe[0].empresaid != id) {
    throw new ClientError("Ruc duplicado", 404);
  }

  const result = await empresaDao.updateEmpresa(req, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  const empresa_actualizada = await empresaDao.getEmpresaByEmpresaid(req, id);
  if (empresa_actualizada.length === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  logger.debug(line(), "empresaUpdated:", empresa_actualizada[0].dataValues);
  response(res, 200, empresa_actualizada[0]);
};

export const deleteEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const result = await empresaDao.deleteEmpresa(req, { ...empresaValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  const empresa_actualizada = await empresaDao.getEmpresaByEmpresaid(req, id);
  if (empresa_actualizada.length === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  logger.debug(line(), "empresaDeleted:", empresa_actualizada[0].dataValues);
  response(res, 204, empresa_actualizada[0]);
};
