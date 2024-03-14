import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import * as empresaDao from "../daos/empresaDao.js";
import { response } from "../utils/response.js";
import { ClientError } from "../utils/errors.js";

import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";

export const getEmpresas = async (req, res) => {
  const empresas = await empresaDao.getEmpresasActivas(req);
  response(res, 201, empresas);
};

export const getEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = Yup.object()
    .shape({
      empresaid: Yup.string().trim().required().min(36).max(36),
    })
    .required();
  var empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await empresaDao.getEmpresaByEmpresaid(req, empresaValidated.empresaid);
  if (rows.length <= 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  response(res, 200, rows[0]);
};

export const deleteEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = Yup.object()
    .shape({
      empresaid: Yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const { empresaid } = empresaValidated;
  var empresa = {
    empresaid,
    idusuariomod: 1,
  };

  const result = await empresaDao.deleteEmpresa(empresa);

  if (result.affectedRows === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  response(res, 204, rows[0]);
};

export const createEmpresa = async (req, res) => {
  const empresaCreateSchema = Yup.object()
    .shape({
      ruc: Yup.string().trim().required().min(11).max(11),
      razon_social: Yup.string().required().max(200),
      nombre_comercial: Yup.string().max(200),
      fecha_inscripcion: Yup.string(),
      domicilio_fiscal: Yup.string().max(200),
      score: Yup.string().max(5),
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

  const empresaCreated = await empresaDao.insertarEmpresa(req, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
  console.debug("Create empresa: ID:" + empresaCreated.idempresa + " | " + camposAdicionales.empresaid);
  console.debug("empresaCreated:", empresaCreated.dataValues);
  response(res, 201, { ...camposAdicionales, ...empresaValidated });
};

export const updateEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaUpdateSchema = Yup.object()
    .shape({
      empresaid: Yup.string().trim().required().min(36).max(36),

      ruc: Yup.string().trim().required().min(11).max(11),
      razon_social: Yup.string().required().max(200),
      nombre_comercial: Yup.string().max(200),
      fecha_inscripcion: Yup.string(),
      domicilio_fiscal: Yup.string().max(200),
      score: Yup.string().max(5),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("empresaValidated:", empresaValidated);

  var camposAdicionales = {};
  camposAdicionales.empresaid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await empresaDao.actualizarEmpresa(req, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
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
