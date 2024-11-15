import * as empresaDao from "../../daos/empresaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activateEmpresa = async (req, res) => {
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
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const empresaDeleted = await empresaDao.activateEmpresa(req, { ...empresaValidated, ...camposAuditoria });
  if (empresaDeleted[0] === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  logger.debug(line(), "empresaActivated:", empresaDeleted);
  response(res, 204, empresaDeleted);
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
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const empresaDeleted = await empresaDao.deleteEmpresa(req, { ...empresaValidated, ...camposAuditoria });
  if (empresaDeleted[0] === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  logger.debug(line(), "empresaDeleted:", empresaDeleted);
  response(res, 204, empresaDeleted);
};

export const getEmpresaMaster = async (req, res) => {
  const filter_estados = [1];

  var empresasMaster = {};

  var empresasMasterJSON = jsonUtils.sequelizeToJSON(empresasMaster);
  //jsonUtils.prettyPrint(empresasMasterJSON);
  var empresasMasterObfuscated = empresasMasterJSON;
  //jsonUtils.prettyPrint(empresasMasterObfuscated);
  var empresasMasterFiltered = jsonUtils.removeAttributesPrivates(empresasMasterObfuscated);
  //jsonUtils.prettyPrint(empresasMaster);
  response(res, 201, empresasMasterFiltered);
};

export const updateEmpresa = async (req, res) => {
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
      score: yup.string().max(5),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  var camposFk = {};

  var camposAdicionales = {};
  camposAdicionales.empresaid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await empresaDao.updateEmpresa(req, {
    ...camposFk,
    ...camposAdicionales,
    ...empresaValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Empresa no existe", 404);
  }
  logger.info(line(), id);
  const empresaUpdated = await empresaDao.getEmpresaByEmpresaid(req, id);
  if (!empresaUpdated) {
    throw new ClientError("Empresa no existe", 404);
  }

  var empresaObfuscated = jsonUtils.ofuscarAtributos(empresaUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var empresaFiltered = jsonUtils.removeAttributesPrivates(empresaObfuscated);
  response(res, 200, empresaFiltered);
};

export const getEmpresas = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estado = [1, 2];
  const empresas = await empresaDao.getEmpresas(req, filter_estado);
  var empresasJson = jsonUtils.sequelizeToJSON(empresas);
  //logger.info(line(),empresaObfuscated);

  //var empresasFiltered = jsonUtils.removeAttributes(empresasJson, ["score"]);
  //empresasFiltered = jsonUtils.removeAttributesPrivates(empresasFiltered);
  response(res, 201, empresasJson);
};

export const createEmpresa = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const empresaCreateSchema = yup
    .object()
    .shape({
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
      score: yup.string().max(5),
    })
    .required();
  var empresaValidated = empresaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  var empresas_por_ruc = await empresaDao.getEmpresaByRuc(req, empresaValidated.ruc);
  if (empresas_por_ruc && empresas_por_ruc.length > 0) {
    throw new ClientError("La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
  }

  var camposFk = {};

  var camposAdicionales = {};
  camposAdicionales.empresaid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const empresaCreated = await empresaDao.insertEmpresa(req, {
    ...camposFk,
    ...camposAdicionales,
    ...empresaValidated,
    ...camposAuditoria,
  });
  //logger.debug(line(),"Create empresa: ID:" + empresaCreated._idempresa + " | " + camposAdicionales.empresaid);
  //logger.debug(line(),"empresaCreated:", empresaCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...empresaValidated });
};
