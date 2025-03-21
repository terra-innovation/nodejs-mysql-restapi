import * as factoringpropuestaDao from "../../daos/factoringpropuestaDao.js";
import * as factoringpropuestaestadoDao from "../../daos/factoringpropuestaestadoDao.js";
import * as factoringtipoDao from "../../daos/factoringtipoDao.js";
import * as factoringestrategiaDao from "../../daos/factoringestrategiaDao.js";
import * as factoringDao from "../../daos/factoringDao.js";
import * as riesgoDao from "../../daos/riesgoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import { simulateFactoringLogicV2 } from "../../logics/factoringLogic.js";

export const createFactoringpropuesta = async (req, res) => {
  logger.debug(line(), "controller::createFactoringpropuesta");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const { id } = req.params;
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  //logger.debug(line(),"factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringValidated.factoringid);
    if (!factoring) {
      logger.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(transaction, factoringValidated.factoringtipoid);
    if (!factoringtipo) {
      logger.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(transaction, factoringValidated.riesgooperacionid);
    if (!riesgooperacion) {
      logger.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringpropuestaestado = await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(transaction, factoringValidated.factoringpropuestaestadoid);
    if (!factoringpropuestaestado) {
      logger.warn(line(), "Factoring propuesta estado no existe: [" + factoringValidated.factoringpropuestaestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(transaction, factoringValidated.factoringestrategiaid);
    if (!factoringestrategia) {
      logger.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var tdm_fix = factoringValidated.tdm / 100;
    var porcentaje_financiado_estimado_fix = factoringValidated.porcentaje_financiado_estimado / 100;
    let fecha_inicio = luxon.DateTime.local();
    let fecha_fin = luxon.DateTime.fromISO(factoring.fecha_pago_estimado.toISOString());
    var dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_inicio.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
    var simulacion = {};
    simulacion = await simulateFactoringLogicV2(riesgooperacion._idriesgo, factoring.cuentabancaria_cuenta_bancarium._idbanco, factoring.cantidad_facturas, factoring.monto_neto, dias_pago_estimado, porcentaje_financiado_estimado_fix, tdm_fix);

    logger.info(line(), "simulacion: ", simulacion);

    await transaction.commit();

    response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringpropuestasByFactoringid = async (req, res) => {
  logger.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringpropuestaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringpropuestaValidated.factoringid);
    if (!factoring) {
      logger.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestasByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var factoringpropuestasJson = jsonUtils.sequelizeToJSON(factoringpropuestas);
    //logger.info(line(),factoringpropuestaObfuscated);

    //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
    //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
    await transaction.commit();
    response(res, 201, factoringpropuestasJson);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const activateFactoringpropuesta = async (req, res) => {
  logger.debug(line(), "controller::activateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringpropuestaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringpropuestaDeleted = await factoringpropuestaDao.activateFactoringpropuesta(transaction, { ...factoringpropuestaValidated, ...camposAuditoria });
    if (factoringpropuestaDeleted[0] === 0) {
      throw new ClientError("Factoringpropuesta no existe", 404);
    }
    logger.debug(line(), "factoringpropuestaActivated:", factoringpropuestaDeleted);
    await transaction.commit();
    response(res, 204, factoringpropuestaDeleted);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteFactoringpropuesta = async (req, res) => {
  logger.debug(line(), "controller::deleteFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringpropuestaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const factoringpropuestaDeleted = await factoringpropuestaDao.deleteFactoringpropuesta(transaction, { ...factoringpropuestaValidated, ...camposAuditoria });
    if (factoringpropuestaDeleted[0] === 0) {
      throw new ClientError("Factoringpropuesta no existe", 404);
    }
    logger.debug(line(), "factoringpropuestaDeleted:", factoringpropuestaDeleted);
    await transaction.commit();
    response(res, 204, factoringpropuestaDeleted);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringpropuestaMaster = async (req, res) => {
  logger.debug(line(), "controller::getFactoringpropuestaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);
    const factoringtipos = await factoringtipoDao.getFactoringtipos(transaction, filter_estados);
    const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(transaction, filter_estados);
    const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(transaction, filter_estados);

    var factoringpropuestasMaster = {};
    factoringpropuestasMaster.riesgos = riesgos;
    factoringpropuestasMaster.factoringtipos = factoringtipos;
    factoringpropuestasMaster.factoringestrategias = factoringestrategias;
    factoringpropuestasMaster.factoringpropuestaestados = factoringpropuestaestados;

    var factoringpropuestasMasterJSON = jsonUtils.sequelizeToJSON(factoringpropuestasMaster);
    //jsonUtils.prettyPrint(factoringpropuestasMasterJSON);
    var factoringpropuestasMasterObfuscated = factoringpropuestasMasterJSON;
    //jsonUtils.prettyPrint(factoringpropuestasMasterObfuscated);
    var factoringpropuestasMasterFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasMasterObfuscated);
    //jsonUtils.prettyPrint(factoringpropuestasMaster);
    await transaction.commit();
    response(res, 201, factoringpropuestasMasterFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateFactoringpropuesta = async (req, res) => {
  logger.debug(line(), "controller::updateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var riesgo = await riesgoDao.getRiesgoByRiesgoid(transaction, factoringpropuestaValidated.riesgoid);
    if (!riesgo) {
      logger.warn(line(), "Riesgo no existe: [" + factoringpropuestaValidated.riesgoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(transaction, factoringpropuestaValidated.factoringpropuestaid);
    if (!factoringpropuesta) {
      logger.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idriesgo = riesgo._idriesgo;

    var camposAdicionales = {};
    camposAdicionales.factoringpropuestaid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...factoringpropuestaValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "factoringpropuestaUpdated:", factoringpropuestaUpdated);

    await transaction.commit();
    response(res, 200, { ...factoringpropuestaValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringpropuestas = async (req, res) => {
  logger.debug(line(), "controller::getFactoringpropuestas");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestas(transaction, filter_estado);
    var factoringpropuestasJson = jsonUtils.sequelizeToJSON(factoringpropuestas);
    //logger.info(line(),factoringpropuestaObfuscated);

    //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
    //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
    await transaction.commit();
    response(res, 201, factoringpropuestasJson);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
