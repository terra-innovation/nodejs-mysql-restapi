import * as colaboradorDao from "../daos/colaboradorDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";

import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";

export const getColaboradores = async (req, res) => {
  const colaboradores = await colaboradorDao.getColaboradoresActivas(req);
  response(res, 201, colaboradores);
};

export const getColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorSchema = Yup.object()
    .shape({
      colaboradorid: Yup.string().trim().required().min(36).max(36),
    })
    .required();
  var colaboradorValidated = colaboradorSchema.validateSync({ colaboradorid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await colaboradorDao.getColaboradorByColaboradorid(req, colaboradorValidated.colaboradorid);
  if (rows.length <= 0) {
    throw new ClientError("Colaborador no existe", 404);
  }
  response(res, 200, rows[0]);
};

export const createColaborador = async (req, res) => {
  const colaboradorCreateSchema = Yup.object()
    .shape({
      empresaid: Yup.string().trim().required().min(36).max(36),
      nombre: Yup.string().required().max(80),
      cargo: Yup.string().required().max(80),
      telefono: Yup.string().required(),
    })
    .required();
  var colaboradorValidated = colaboradorCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  console.debug("colaboradorValidated:", colaboradorValidated);

  var empresa = await empresaDao.findEmpresaPk(req, colaboradorValidated.empresaid);
  if (empresa.length === 0) {
    throw new ClientError("Empresa no existe", 404);
  }

  var camposFk = {};
  camposFk.idempresa = empresa[0].idempresa;

  var camposAdicionales = {};
  camposAdicionales.colaboradorid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const colaboradorCreated = await colaboradorDao.insertColaborador(req, { ...camposFk, ...camposAdicionales, ...colaboradorValidated, ...camposAuditoria });
  console.debug("Create colaborador: ID:" + colaboradorCreated.idcolaborador + " | " + camposAdicionales.colaboradorid);
  console.debug("colaboradorCreated:", colaboradorCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...colaboradorValidated });
};

export const updateColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorUpdateSchema = Yup.object()
    .shape({
      colaboradorid: Yup.string().trim().required().min(36).max(36),

      nombre: Yup.string().trim().required().max(80),
      cargo: Yup.string().trim().required().max(80),
      telefono: Yup.string().trim().required(),
    })
    .required();
  const colaboradorValidated = colaboradorUpdateSchema.validateSync({ colaboradorid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("colaboradorValidated:", colaboradorValidated);

  var camposAdicionales = {};
  camposAdicionales.colaboradorid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await colaboradorDao.updateColaborador(req, { ...camposAdicionales, ...colaboradorValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Colaborador no existe", 404);
  }
  const colaborador_actualizada = await colaboradorDao.getColaboradorByColaboradorid(req, id);
  if (colaborador_actualizada.length === 0) {
    throw new ClientError("Colaborador no existe", 404);
  }
  console.debug("colaboradorUpdated:", colaborador_actualizada[0].dataValues);
  response(res, 200, colaborador_actualizada[0]);
};

export const deleteColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorSchema = Yup.object()
    .shape({
      colaboradorid: Yup.string().trim().required().min(36).max(36),
    })
    .required();
  const colaboradorValidated = colaboradorSchema.validateSync({ colaboradorid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("colaboradorValidated:", colaboradorValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const result = await colaboradorDao.deleteColaborador(req, { ...colaboradorValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Colaborador no existe", 404);
  }
  const colaborador_actualizada = await colaboradorDao.getColaboradorByColaboradorid(req, id);
  if (colaborador_actualizada.length === 0) {
    throw new ClientError("Colaborador no existe", 404);
  }
  console.debug("colaboradorDeleted:", colaborador_actualizada[0].dataValues);
  response(res, 204, colaborador_actualizada[0]);
};
