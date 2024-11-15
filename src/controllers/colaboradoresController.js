import * as colaboradorDao from "../daos/colaboradorDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getColaboradores = async (req, res) => {
  const colaboradores = await colaboradorDao.getColaboradoresActivas(req);
  response(res, 201, colaboradores);
};

export const getColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorSchema = yup
    .object()
    .shape({
      colaboradorid: yup.string().trim().required().min(36).max(36),
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
  const colaboradorCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      nombre: yup.string().required().max(80),
      cargo: yup.string().required().max(80),
      email: yup.string().required().email().max(80),
      telefono: yup.string().required(),
    })
    .required();
  var colaboradorValidated = colaboradorCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "colaboradorValidated:", colaboradorValidated);

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
  logger.debug(line(), "Create colaborador: ID:" + colaboradorCreated.idcolaborador + " | " + camposAdicionales.colaboradorid);
  logger.debug(line(), "colaboradorCreated:", colaboradorCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...colaboradorValidated });
};

export const updateColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorUpdateSchema = yup
    .object()
    .shape({
      colaboradorid: yup.string().trim().required().min(36).max(36),

      nombre: yup.string().trim().required().max(80),
      cargo: yup.string().trim().required().max(80),
      email: yup.string().required().email().max(80),
      telefono: yup.string().trim().required(),
    })
    .required();
  const colaboradorValidated = colaboradorUpdateSchema.validateSync({ colaboradorid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "colaboradorValidated:", colaboradorValidated);

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
  logger.debug(line(), "colaboradorUpdated:", colaborador_actualizada[0].dataValues);
  response(res, 200, colaborador_actualizada[0]);
};

export const deleteColaborador = async (req, res) => {
  const { id } = req.params;
  const colaboradorSchema = yup
    .object()
    .shape({
      colaboradorid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const colaboradorValidated = colaboradorSchema.validateSync({ colaboradorid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "colaboradorValidated:", colaboradorValidated);

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
  logger.debug(line(), "colaboradorDeleted:", colaborador_actualizada[0].dataValues);
  response(res, 204, colaborador_actualizada[0]);
};
