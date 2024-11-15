import * as cuentabancariaestadoDao from "../../daos/cuentabancariaestadoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activateCuentabancariaestado = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = session_idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.activateCuentaBancariaEstado(req, { ...cuentabancariaestadoValidated, ...camposAuditoria });
  if (cuentabancariaestadoDeleted[0] === 0) {
    throw new ClientError("Cuentabancariaestado no existe", 404);
  }
  logger.debug(line(), "cuentabancariaestadoActivated:", cuentabancariaestadoDeleted);
  response(res, 204, cuentabancariaestadoDeleted);
};

export const deleteCuentabancariaestado = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync({ cuentabancariaestadoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = session_idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const cuentabancariaestadoDeleted = await cuentabancariaestadoDao.deleteCuentaBancariaEstado(req, { ...cuentabancariaestadoValidated, ...camposAuditoria });
  if (cuentabancariaestadoDeleted[0] === 0) {
    throw new ClientError("Cuentabancariaestado no existe", 404);
  }
  logger.debug(line(), "cuentabancariaestadoDeleted:", cuentabancariaestadoDeleted);
  response(res, 204, cuentabancariaestadoDeleted);
};

export const updateCuentabancariaestado = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const { id } = req.params;
  const cuentabancariaestadoUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoUpdateSchema.validateSync({ cuentabancariaestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  var camposAdicionales = {};
  camposAdicionales.cuentabancariaestadoid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = session_idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await cuentabancariaestadoDao.updateCuentaBancariaEstado(req, {
    ...camposAdicionales,
    ...cuentabancariaestadoValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Cuentabancariaestado no existe", 404);
  }
  logger.info(line(), id);
  const cuentabancariaestadoUpdated = await cuentabancariaestadoDao.getCuentaBancariaEstadoByCuentaBancariaEstadoid(req, id);
  if (!cuentabancariaestadoUpdated) {
    throw new ClientError("Cuentabancariaestado no existe", 404);
  }

  var cuentabancariaestadoObfuscated = jsonUtils.ofuscarAtributos(cuentabancariaestadoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var cuentabancariaestadoFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadoObfuscated);
  response(res, 200, cuentabancariaestadoFiltered);
};

export const getCuentasbancarias = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estado = [1, 2];
  const cuentabancariaestados = await cuentabancariaestadoDao.getCuentaBancariaEstados(req, filter_estado);
  var cuentabancariaestadosJson = jsonUtils.sequelizeToJSON(cuentabancariaestados);
  //logger.info(line(),empresaObfuscated);

  //var cuentabancariaestadosFiltered = jsonUtils.removeAttributes(cuentabancariaestadosJson, ["score"]);
  //cuentabancariaestadosFiltered = jsonUtils.removeAttributesPrivates(cuentabancariaestadosFiltered);
  response(res, 201, cuentabancariaestadosJson);
};

export const createCuentabancariaestado = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const cuentabancariaestadoCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  var cuentabancariaestadoValidated = cuentabancariaestadoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  var camposAdicionales = {};
  camposAdicionales.cuentabancariaestadoid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = session_idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = session_idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const cuentabancariaestadoCreated = await cuentabancariaestadoDao.insertCuentaBancariaEstado(req, {
    ...camposAdicionales,
    ...cuentabancariaestadoValidated,
    ...camposAuditoria,
  });
  //logger.debug(line(),"Create cuentabancariaestado: ID:" + cuentabancariaestadoCreated._idcuentabancariaestado + " | " + camposAdicionales.cuentabancariaestadoid);
  //logger.debug(line(),"cuentabancariaestadoCreated:", cuentabancariaestadoCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...cuentabancariaestadoValidated });
};
