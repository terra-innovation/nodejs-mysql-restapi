import * as facturaDao from "../../daos/facturaDao.js";
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

export const getFacturasByFactoringid = async (req, res) => {
  logger.debug(line(), "controller::getFacturasByFactoringid");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, facturaValidated.factoringid);
    if (!factoring) {
      logger.warn(line(), "Factoring no existe: [" + facturaValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const facturas = await facturaDao.getFacturasByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var facturasJson = jsonUtils.sequelizeToJSON(facturas);
    //logger.info(line(),facturaObfuscated);

    //var facturasFiltered = jsonUtils.removeAttributes(facturasJson, ["score"]);
    //facturasFiltered = jsonUtils.removeAttributesPrivates(facturasFiltered);
    await transaction.commit();
    response(res, 201, facturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const activateFactura = async (req, res) => {
  logger.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const facturaDeleted = await facturaDao.activateFactura(transaction, { ...facturaValidated, ...camposAuditoria });
    if (facturaDeleted[0] === 0) {
      throw new ClientError("Factura no existe", 404);
    }
    logger.debug(line(), "facturaActivated:", facturaDeleted);
    await transaction.commit();
    response(res, 204, facturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteFactura = async (req, res) => {
  logger.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const facturaDeleted = await facturaDao.deleteFactura(transaction, { ...facturaValidated, ...camposAuditoria });
    if (facturaDeleted[0] === 0) {
      throw new ClientError("Factura no existe", 404);
    }
    logger.debug(line(), "facturaDeleted:", facturaDeleted);
    await transaction.commit();
    response(res, 204, facturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFacturaMaster = async (req, res) => {
  logger.debug(line(), "controller::getFacturaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);
    var facturasMaster = {};
    facturasMaster.riesgos = riesgos;
    var facturasMasterJSON = jsonUtils.sequelizeToJSON(facturasMaster);
    //jsonUtils.prettyPrint(facturasMasterJSON);
    var facturasMasterObfuscated = facturasMasterJSON;
    //jsonUtils.prettyPrint(facturasMasterObfuscated);
    var facturasMasterFiltered = jsonUtils.removeAttributesPrivates(facturasMasterObfuscated);
    //jsonUtils.prettyPrint(facturasMaster);
    await transaction.commit();
    response(res, 201, facturasMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateFactura = async (req, res) => {
  logger.debug(line(), "controller::updateFactura");
  const { id } = req.params;
  const facturaUpdateSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  const facturaValidated = facturaUpdateSchema.validateSync({ facturaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, facturaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + facturaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura = await facturaDao.getFacturaByFacturaid(transaction, facturaValidated.facturaid);
    if (!factura) {
      logger.warn(line(), "Factura no existe: [" + facturaValidated.facturaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.facturaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const facturaUpdated = await facturaDao.updateFactura(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...facturaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "facturaUpdated:", facturaUpdated);

    await transaction.commit();
    response(res, 200, { ...facturaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFacturas = async (req, res) => {
  logger.debug(line(), "controller::getFacturas");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const facturas = await facturaDao.getFacturas(transaction, filter_estado);
    var facturasJson = jsonUtils.sequelizeToJSON(facturas);
    //logger.info(line(),facturaObfuscated);

    //var facturasFiltered = jsonUtils.removeAttributes(facturasJson, ["score"]);
    //facturasFiltered = jsonUtils.removeAttributesPrivates(facturasFiltered);
    await transaction.commit();
    response(res, 201, facturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createFactura = async (req, res) => {
  logger.debug(line(), "controller::createFactura");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const facturaCreateSchema = yup
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
  var facturaValidated = facturaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, facturaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + facturaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var facturas_por_ruc = await facturaDao.getFacturaByRuc(transaction, facturaValidated.ruc);
    if (facturas_por_ruc) {
      logger.warn(line(), "La factura [" + facturaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.");
      throw new ClientError("La factura [" + facturaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.facturaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const facturaCreated = await facturaDao.insertFactura(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...facturaValidated,
      ...camposAuditoria,
    });
    //logger.debug(line(),"Create factura: ID:" + facturaCreated._idfactura + " | " + camposAdicionales.facturaid);
    //logger.debug(line(),"facturaCreated:", facturaCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idfactura;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...facturaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
