import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as factoringestadoDao from "#src/daos/factoringestadoDao.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuestaDao.js";
import * as factoringtipoDao from "#src/daos/factoringtipoDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { simulateFactoringLogicV1 } from "#src/logics/factoringLogic.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { FactoringAttributes } from "#src/models/ft_factoring/Factoring.js";

import * as luxon from "luxon";
import { Sequelize, Op } from "sequelize";
import * as yup from "yup";

export const activateFactoring = async (req, res) => {
  log.debug(line(), "controller::activateFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<FactoringAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringActivated = await factoringDao.activateFactoring(transaction, { ...factoringValidated, ...camposAuditoria });
    if (factoringActivated[0] === 0) {
      throw new ClientError("Factoring no existe", 404);
    }
    log.debug(line(), "factoringActivated:", factoringActivated);
    await transaction.commit();
    response(res, 204, factoringActivated);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteFactoring = async (req, res) => {
  log.debug(line(), "controller::deleteFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<FactoringAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const factoringDeleted = await factoringDao.deleteFactoring(transaction, { ...factoringValidated, ...camposAuditoria });
    if (factoringDeleted[0] === 0) {
      throw new ClientError("Factoringpropuesta no existe", 404);
    }
    log.debug(line(), "factoringDeleted:", factoringDeleted);
    await transaction.commit();
    response(res, 204, factoringDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateFactoring = async (req, res) => {
  log.debug(line(), "controller::updateFactoring");
  const { id } = req.params;
  const factoringUpdateSchema = yup.object().shape({
    factoringid: yup.string().trim().required().min(36).max(36),
    factoringestadoid: yup.string().trim().required().min(36).max(36),
    factoringpropuestaaceptadaid: yup.string().trim().min(36).max(36),
  });
  const factoringValidated = factoringUpdateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(transaction, factoringValidated.factoringestadoid);
    if (!factoringestado) {
      log.warn(line(), "Factoring estado no existe: [" + factoringValidated.factoringestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    if (factoringValidated.factoringpropuestaaceptadaid) {
      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(transaction, factoringValidated.factoringpropuestaaceptadaid);
      if (!factoringpropuesta) {
        log.warn(line(), "factoring propuesta no existe: [" + factoringValidated.factoringpropuestaaceptadaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
    }

    var camposFactoringFk: Partial<FactoringAttributes> = {};
    camposFactoringFk._idfactoringestado = factoringestado._idfactoringestado;
    if (factoringValidated.factoringpropuestaaceptadaid) {
      camposFactoringFk._idfactoringpropuestaaceptada = factoringpropuesta._idfactoringpropuesta;
    } else {
      camposFactoringFk._idfactoringpropuestaaceptada = null;
    }

    var camposFactoringAdicionales: Partial<FactoringAttributes> = {};
    camposFactoringAdicionales.factoringid = factoring.factoringid;

    var camposFactoringAuditoria: Partial<FactoringAttributes> = {};
    camposFactoringAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposFactoringAuditoria.fechamod = Sequelize.fn("now", 3);

    const factoringUpdated = await factoringDao.updateFactoring(transaction, {
      ...camposFactoringFk,
      ...camposFactoringAdicionales,
      ...factoringValidated,
      ...camposFactoringAuditoria,
    });
    log.debug(line(), "factoringUpdated", factoringUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const simulateFactoring = async (req, res) => {
  log.debug(line(), "controller::simulateFactoring");
  const { id } = req.params;
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      tnm: yup.number().required().min(1).max(100),
      porcentaje_adelanto: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(transaction, factoringValidated.factoringtipoid);
    if (!factoringtipo) {
      log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(transaction, factoringValidated.riesgooperacionid);
    if (!riesgooperacion) {
      log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var dias_pago_estimado = luxon.DateTime.fromISO(factoring.fecha_pago_estimado).startOf("day").diff(luxon.DateTime.local().startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
    var simulacion = {};
    simulacion = await simulateFactoringLogicV1(riesgooperacion._idriesgo, factoring.cuentabancaria_cuenta_bancarium._idbanco, factoring.cantidad_facturas, factoring.monto_neto, dias_pago_estimado, factoringValidated.porcentaje_adelanto, factoringValidated.tnm);

    log.info(line(), "simulacion: ", simulacion);

    await transaction.commit();

    response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringMaster = async (req, res) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringtipos = await factoringtipoDao.getFactoringtipos(transaction, filter_estados);
    const factoringestados = await factoringestadoDao.getFactoringestados(transaction, filter_estados);
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);

    var factoringsMaster: Record<string, any> = {};
    factoringsMaster.factoringtipos = factoringtipos;
    factoringsMaster.factoringestados = factoringestados;
    factoringsMaster.riesgos = riesgos;

    var factoringsMasterJSON = jsonUtils.sequelizeToJSON(factoringsMaster);
    //jsonUtils.prettyPrint(factoringsMasterJSON);
    var factoringsMasterObfuscated = factoringsMasterJSON;
    //jsonUtils.prettyPrint(factoringsMasterObfuscated);
    var factoringsMasterFiltered = jsonUtils.removeAttributesPrivates(factoringsMasterObfuscated);
    //jsonUtils.prettyPrint(factoringsMasterFiltered);
    await transaction.commit();
    response(res, 201, factoringsMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactorings = async (req, res) => {
  log.debug(line(), "controller::getFactorings");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1, 2];
    const factorings = await factoringDao.getFactoringsByEstados(transaction, filter_estados);
    await transaction.commit();
    response(res, 201, factorings);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
