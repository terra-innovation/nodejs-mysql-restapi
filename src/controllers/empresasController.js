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
  const data = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const { empresaid } = data;
  var empresa = {
    empresaid,
  };
  const rows = await empresaDao.getEmpresaByEmpresaid(req, empresa.empresaid);
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
  const data = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  const { empresaid } = data;
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
  const empresaSchema = Yup.object()
    .shape({
      ruc: Yup.string().trim().required().min(11).max(11),
      razon_social: Yup.string().required().max(200),
      nombre_comercial: Yup.string().max(200),
      fecha_inscripcion: Yup.string(),
      domicilio_fiscal: Yup.string().max(200),
      score: Yup.string().max(5),
    })
    .required();
  const data = empresaSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const { ruc, razon_social, nombre_comercial, fecha_inscripcion, domicilio_fiscal, score } = data;
  var empresa = {
    empresaid: uuidv4(),
    code: uuidv4().split("-")[0],
    ruc: ruc,
    razon_social: razon_social,
    nombre_comercial: nombre_comercial,
    fecha_inscripcion: fecha_inscripcion,
    domicilio_fiscal: domicilio_fiscal,
    score: score,
    idusuariocrea: 1,
    //fechacrea: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
    idusuariomod: 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const result = await empresaDao.insertarEmpresa(req, empresa);
  console.debug("Create empresa: ID:" + result.idempresa + " | " + empresa.empresaid);
  //res.status(201).json({ empresa });
  response(res, 201, result);
};

export const updateEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaSchema = Yup.object()
    .shape({
      ruc: Yup.string().trim().required("Ruc es requerido").min(11, "Mínimo 11 caracteres").max(11, "Máximo 11 caracteres"),
      razon_social: Yup.string().required("Razon Social es requerido").max(200, "Máximo 20 caracteres"),
      nombre_comercial: Yup.string().max(200, "Máximo 20 caracteres"),
      fecha_inscripcion: Yup.string(),
      domicilio_fiscal: Yup.string().max(200, "Máximo 20 caracteres"),
      score: Yup.string().max(5, "Máximo 20 caracteres"),
    })
    .required();
  const data = empresaSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const { ruc, razon_social, nombre_comercial, fecha_inscripcion, domicilio_fiscal, score } = data;
  var empresa = {
    empresaid: id,
    ruc: ruc,
    razon_social: razon_social,
    nombre_comercial: nombre_comercial,
    fecha_inscripcion: fecha_inscripcion,
    domicilio_fiscal: domicilio_fiscal,
    score: score,
    idusuariomod: 1,
  };
  const result = await empresaDao.actualizarEmpresa(empresa);

  if (result.affectedRows === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  const rows = await empresaDao.getEmpresaByEmpresaid(empresa.empresaid);

  response(res, 200, rows[0]);
};
