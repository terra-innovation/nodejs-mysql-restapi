import * as facturaDao from "#src/daos/facturaDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import { FacturaAttributes } from "#src/models/ft_factoring/Factura";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";

export const getFacturasByFactoringid = async (req, res) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  //log.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, facturaValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + facturaValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const facturas = await facturaDao.getFacturasByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var facturasJson = jsonUtils.sequelizeToJSON(facturas);
    //log.info(line(),facturaObfuscated);

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
  log.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<FacturaAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const facturaDeleted = await facturaDao.activateFactura(transaction, { ...facturaValidated, ...camposAuditoria });
    if (facturaDeleted[0] === 0) {
      throw new ClientError("Factura no existe", 404);
    }
    log.debug(line(), "facturaActivated:", facturaDeleted);
    await transaction.commit();
    response(res, 204, facturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteFactura = async (req, res) => {
  log.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<FacturaAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const facturaDeleted = await facturaDao.deleteFactura(transaction, { ...facturaValidated, ...camposAuditoria });
    if (facturaDeleted[0] === 0) {
      throw new ClientError("Factura no existe", 404);
    }
    log.debug(line(), "facturaDeleted:", facturaDeleted);
    await transaction.commit();
    response(res, 204, facturaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFacturaMaster = async (req, res) => {
  log.debug(line(), "controller::getFacturaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);
    var facturasMaster: Record<string, any> = {};
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

export const getFacturas = async (req, res) => {
  log.debug(line(), "controller::getFacturas");
  //log.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const facturas = await facturaDao.getFacturas(transaction, filter_estado);
    var facturasJson = jsonUtils.sequelizeToJSON(facturas);
    //log.info(line(),facturaObfuscated);

    //var facturasFiltered = jsonUtils.removeAttributes(facturasJson, ["score"]);
    //facturasFiltered = jsonUtils.removeAttributesPrivates(facturasFiltered);
    await transaction.commit();
    response(res, 201, facturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
