import * as empresaDao from "../daos/empresaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as ofuscarUtils from "../utils/ofuscarUtils.js";

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

  var usuarioOfuscado = ofuscarUtils.ofuscarAtributos(rows[0], ["email"], ofuscarUtils.PATRON_OFUSCAR_EMAIL);
  usuarioOfuscado = ofuscarUtils.ofuscarAtributos(usuarioOfuscado, ["nombre"], ofuscarUtils.PATRON_OFUSCAR_NOMBRE);
  usuarioOfuscado = ofuscarUtils.ofuscarAtributos(usuarioOfuscado, ["telefono"], ofuscarUtils.PATRON_OFUSCAR_TELEFONO);
  //console.log(usuarioOfuscado);
  response(res, 200, usuarioOfuscado);
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

  var usuarioOfuscado = ofuscarUtils.ofuscarAtributos(rows[0], ["email"], ofuscarUtils.PATRON_OFUSCAR_EMAIL);
  usuarioOfuscado = ofuscarUtils.ofuscarAtributos(usuarioOfuscado, ["nombre"], ofuscarUtils.PATRON_OFUSCAR_NOMBRE);
  usuarioOfuscado = ofuscarUtils.ofuscarAtributos(usuarioOfuscado, ["telefono"], ofuscarUtils.PATRON_OFUSCAR_TELEFONO);
  //console.log(usuarioOfuscado);
  response(res, 200, usuarioOfuscado);
};

export const getEmpresas = async (req, res) => {
  const empresas = await empresaDao.getEmpresasActivas(req);
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
  console.debug("empresaValidated:", empresaValidated);
  var camposAdicionales = {};
  camposAdicionales.empresaid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const empresa_existe = await empresaDao.getEmpresaByRuc(req, empresaValidated.ruc);

  if (empresa_existe.length >= 1) {
    throw new ClientError("Empresa ya existe", 404);
  }
  const empresaCreated = await empresaDao.insertEmpresa(req, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
  console.debug("Create empresa: ID:" + empresaCreated.idempresa + " | " + camposAdicionales.empresaid);
  console.debug("empresaCreated:", empresaCreated.dataValues);
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
  console.debug("empresaValidated:", empresaValidated);

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
  console.debug("empresaUpdated:", empresa_actualizada[0].dataValues);
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
  console.debug("empresaValidated:", empresaValidated);

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
  console.debug("empresaDeleted:", empresa_actualizada[0].dataValues);
  response(res, 204, empresa_actualizada[0]);
};
