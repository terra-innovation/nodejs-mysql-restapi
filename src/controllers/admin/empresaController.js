import * as empresaDao from "#src/daos/empresaDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activateEmpresa = async (req, res) => {
  logger.debug(line(), "controller::activateEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const empresaDeleted = await empresaDao.activateEmpresa(transaction, { ...empresaValidated, ...camposAuditoria });
    if (empresaDeleted[0] === 0) {
      throw new ClientError("Empresa no existe", 404);
    }
    logger.debug(line(), "empresaActivated:", empresaDeleted);
    await transaction.commit();
    response(res, 204, empresaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteEmpresa = async (req, res) => {
  logger.debug(line(), "controller::deleteEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const empresaDeleted = await empresaDao.deleteEmpresa(transaction, { ...empresaValidated, ...camposAuditoria });
    if (empresaDeleted[0] === 0) {
      throw new ClientError("Empresa no existe", 404);
    }
    logger.debug(line(), "empresaDeleted:", empresaDeleted);
    await transaction.commit();
    response(res, 204, empresaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresaMaster = async (req, res) => {
  logger.debug(line(), "controller::getEmpresaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);
    var empresasMaster = {};
    empresasMaster.riesgos = riesgos;
    var empresasMasterJSON = jsonUtils.sequelizeToJSON(empresasMaster);
    //jsonUtils.prettyPrint(empresasMasterJSON);
    var empresasMasterObfuscated = empresasMasterJSON;
    //jsonUtils.prettyPrint(empresasMasterObfuscated);
    var empresasMasterFiltered = jsonUtils.removeAttributesPrivates(empresasMasterObfuscated);
    //jsonUtils.prettyPrint(empresasMaster);
    await transaction.commit();
    response(res, 201, empresasMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateEmpresa = async (req, res) => {
  logger.debug(line(), "controller::updateEmpresa");
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, empresaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, empresaValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + empresaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.empresaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const empresaUpdated = await empresaDao.updateEmpresa(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...empresaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "empresaUpdated:", empresaUpdated);

    await transaction.commit();
    response(res, 200, { ...empresaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresas = async (req, res) => {
  logger.debug(line(), "controller::getEmpresas");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const empresas = await empresaDao.getEmpresas(transaction, filter_estado);
    var empresasJson = jsonUtils.sequelizeToJSON(empresas);
    //logger.info(line(),empresaObfuscated);

    //var empresasFiltered = jsonUtils.removeAttributes(empresasJson, ["score"]);
    //empresasFiltered = jsonUtils.removeAttributesPrivates(empresasFiltered);
    await transaction.commit();
    response(res, 201, empresasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createEmpresa = async (req, res) => {
  logger.debug(line(), "controller::createEmpresa");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const empresaCreateSchema = yup
    .object()
    .shape({
      riesgoid: yup.string().trim().required().min(36).max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  var empresaValidated = empresaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaValidated:", empresaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, empresaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var empresas_por_ruc = await empresaDao.getEmpresaByRuc(transaction, empresaValidated.ruc);
    if (empresas_por_ruc) {
      logger.warn(line(), "La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.");
      throw new ClientError("La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.empresaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const empresaCreated = await empresaDao.insertEmpresa(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...empresaValidated,
      ...camposAuditoria,
    });
    //logger.debug(line(),"Create empresa: ID:" + empresaCreated._idempresa + " | " + camposAdicionales.empresaid);
    //logger.debug(line(),"empresaCreated:", empresaCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...empresaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
