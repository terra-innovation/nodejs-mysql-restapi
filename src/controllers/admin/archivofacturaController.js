import * as archivofacturaDao from "../../daos/archivofacturaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as factoringDao from "../../daos/factoringDao.js";
import * as riesgoDao from "../../daos/riesgoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { safeRollback } from "../../utils/transactionUtils.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getArchivofacturasByFactoringid = async (req, res) => {
  logger.debug(line(), "controller::getArchivofacturasByFactoringid");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const archivofacturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, archivofacturaValidated.factoringid);
    if (!factoring) {
      logger.warn(line(), "Factoring no existe: [" + archivofacturaValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const archivofacturas = await archivofacturaDao.getArchivofacturasByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var archivofacturasJson = jsonUtils.sequelizeToJSON(archivofacturas);
    //logger.info(line(),archivofacturaObfuscated);

    //var archivofacturasFiltered = jsonUtils.removeAttributes(archivofacturasJson, ["score"]);
    //archivofacturasFiltered = jsonUtils.removeAttributesPrivates(archivofacturasFiltered);
    await transaction.commit();
    response(res, 201, archivofacturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const activateArchivofactura = async (req, res) => {
  logger.debug(line(), "controller::activateArchivofactura");
  const { id } = req.params;
  const archivofacturaSchema = yup
    .object()
    .shape({
      archivofacturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSchema.validateSync({ archivofacturaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const archivofacturaDeleted = await archivofacturaDao.activateArchivofactura(transaction, { ...archivofacturaValidated, ...camposAuditoria });
    if (archivofacturaDeleted[0] === 0) {
      throw new ClientError("Archivofactura no existe", 404);
    }
    logger.debug(line(), "archivofacturaActivated:", archivofacturaDeleted);
    await transaction.commit();
    response(res, 204, archivofacturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteArchivofactura = async (req, res) => {
  logger.debug(line(), "controller::deleteArchivofactura");
  const { id } = req.params;
  const archivofacturaSchema = yup
    .object()
    .shape({
      archivofacturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSchema.validateSync({ archivofacturaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const archivofacturaDeleted = await archivofacturaDao.deleteArchivofactura(transaction, { ...archivofacturaValidated, ...camposAuditoria });
    if (archivofacturaDeleted[0] === 0) {
      throw new ClientError("Archivofactura no existe", 404);
    }
    logger.debug(line(), "archivofacturaDeleted:", archivofacturaDeleted);
    await transaction.commit();
    response(res, 204, archivofacturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getArchivofacturaMaster = async (req, res) => {
  logger.debug(line(), "controller::getArchivofacturaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);
    var archivofacturasMaster = {};
    archivofacturasMaster.riesgos = riesgos;
    var archivofacturasMasterJSON = jsonUtils.sequelizeToJSON(archivofacturasMaster);
    //jsonUtils.prettyPrint(archivofacturasMasterJSON);
    var archivofacturasMasterObfuscated = archivofacturasMasterJSON;
    //jsonUtils.prettyPrint(archivofacturasMasterObfuscated);
    var archivofacturasMasterFiltered = jsonUtils.removeAttributesPrivates(archivofacturasMasterObfuscated);
    //jsonUtils.prettyPrint(archivofacturasMaster);
    await transaction.commit();
    response(res, 201, archivofacturasMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateArchivofactura = async (req, res) => {
  logger.debug(line(), "controller::updateArchivofactura");
  const { id } = req.params;
  const archivofacturaUpdateSchema = yup
    .object()
    .shape({
      archivofacturaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  const archivofacturaValidated = archivofacturaUpdateSchema.validateSync({ archivofacturaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, archivofacturaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + archivofacturaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var archivofactura = await archivofacturaDao.getArchivofacturaByArchivofacturaid(transaction, archivofacturaValidated.archivofacturaid);
    if (!archivofactura) {
      logger.warn(line(), "Archivofactura no existe: [" + archivofacturaValidated.archivofacturaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.archivofacturaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const archivofacturaUpdated = await archivofacturaDao.updateArchivofactura(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...archivofacturaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "archivofacturaUpdated:", archivofacturaUpdated);

    await transaction.commit();
    response(res, 200, { ...archivofacturaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getArchivofacturas = async (req, res) => {
  logger.debug(line(), "controller::getArchivofacturas");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const archivofacturas = await archivofacturaDao.getArchivofacturas(transaction, filter_estado);
    var archivofacturasJson = jsonUtils.sequelizeToJSON(archivofacturas);
    //logger.info(line(),archivofacturaObfuscated);

    //var archivofacturasFiltered = jsonUtils.removeAttributes(archivofacturasJson, ["score"]);
    //archivofacturasFiltered = jsonUtils.removeAttributesPrivates(archivofacturasFiltered);
    await transaction.commit();
    response(res, 201, archivofacturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createArchivofactura = async (req, res) => {
  logger.debug(line(), "controller::createArchivofactura");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const archivofacturaCreateSchema = yup
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
  var archivofacturaValidated = archivofacturaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, archivofacturaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + archivofacturaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var archivofacturas_por_ruc = await archivofacturaDao.getArchivofacturaByRuc(transaction, archivofacturaValidated.ruc);
    if (archivofacturas_por_ruc) {
      logger.warn(line(), "La archivofactura [" + archivofacturaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.");
      throw new ClientError("La archivofactura [" + archivofacturaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.archivofacturaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const archivofacturaCreated = await archivofacturaDao.insertArchivofactura(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...archivofacturaValidated,
      ...camposAuditoria,
    });
    //logger.debug(line(),"Create archivofactura: ID:" + archivofacturaCreated._idarchivofactura + " | " + camposAdicionales.archivofacturaid);
    //logger.debug(line(),"archivofacturaCreated:", archivofacturaCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idarchivofactura;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...archivofacturaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
