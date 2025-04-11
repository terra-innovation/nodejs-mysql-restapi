import * as factoringpropuestaDao from "#src/daos/factoringpropuestaDao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinancieroDao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestadoDao.js";
import * as factoringtipoDao from "#src/daos/factoringtipoDao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategiaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import { simulateFactoringLogicV2 } from "#src/logics/factoringLogic.js";

import { unlink } from "fs/promises";
import path from "path"; // Para eliminar el archivo después de enviarlo
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as fs from "fs";

export const downloadFactoringpropuestaPDF = async (req, res) => {
  logger.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(transaction, factoringpropuestaValidated.factoringpropuestaid);
    if (!factoringpropuesta) {
      logger.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    //logger.debug(line(), "factoringpropuesta:", jsonUtils.sequelizeToJSON(factoringpropuesta));

    var factoring = await factoringDao.getFactoringByIdfactoring(transaction, factoringpropuesta._idfactoring);
    if (!factoring) {
      logger.warn(line(), "Factoring no existe: [" + factoringpropuesta._idfactoring + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    //logger.debug(line(), "factoringpropuesta:", jsonUtils.sequelizeToJSON(factoring));

    // Generar el PDF
    const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
    const filename = formattedDate + "_factoring_propuesta_" + factoring.cedente_empresa.ruc + "_" + factoringpropuesta.code + ".pdf";
    const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
    const filePath = path.join(dirPath, filename);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const pdfGenerator = new PDFGenerator(filePath);
    await pdfGenerator.generateFactoringQuote(factoring, factoringpropuesta);

    let filenameDownload = "Factoring_Propuesta_" + factoring.cedente_empresa.ruc + "_" + factoringpropuesta.code + "_" + formattedDate + ".pdf";

    // res.setHeader("Content-Disposition", 'attachment; filename="' + filenameDownload + '"');

    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
    await unlink(filePath);
    await transaction.commit();
  } catch (error) {
    await safeRollback(transaction);
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
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(transaction, factoringpropuestaValidated.factoringpropuestaid);
    if (!factoringpropuesta) {
      logger.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringpropuestaestado = await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(transaction, factoringpropuestaValidated.factoringpropuestaestadoid);
    if (!factoringpropuestaestado) {
      logger.warn(line(), "Factoringpropuestaestado no existe: [" + factoringpropuestaValidated.factoringpropuestaestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idfactoringpropuestaestado = factoringpropuestaestado._idfactoringpropuestaestado;

    var camposAdicionales = {};
    camposAdicionales.factoringpropuestaid = factoringpropuestaValidated.factoringpropuestaid;

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
    await safeRollback(transaction);
    throw error;
  }
};

export const createFactoringpropuesta = async (req, res) => {
  logger.debug(line(), "controller::createFactoringpropuesta");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
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
  var factoringValidated = factoringSimulateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
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

    let fecha_ahora = luxon.DateTime.local();
    let fecha_fin = luxon.DateTime.fromISO(factoring.fecha_pago_estimado.toISOString());
    var dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
    var simulacion = {};
    simulacion = await simulateFactoringLogicV2(riesgooperacion._idriesgo, factoring.cuentabancaria_cuenta_bancarium._idbanco, factoring.cantidad_facturas, factoring.monto_neto, dias_pago_estimado, factoringValidated.porcentaje_financiado_estimado, factoringValidated.tdm);

    logger.info(line(), "simulacion: ", simulacion);

    var camposFk = {};
    camposFk._idfactoring = factoring._idfactoring;
    camposFk._idfactoringtipo = factoringtipo._idfactoringtipo;
    camposFk._idfactoringpropuestaestado = factoringpropuestaestado._idfactoringpropuestaestado;
    camposFk._idriesgooperacion = riesgooperacion._idriesgo;
    camposFk._idfactoringestrategia = factoringestrategia._idfactoringestrategia;

    var camposAdicionales = {};
    camposAdicionales.factoringpropuestaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];
    camposAdicionales.fecha_propuesta = Sequelize.fn("now", 3);
    camposAdicionales.dias_antiguedad_estimado = fecha_ahora.startOf("day").diff(luxon.DateTime.fromISO(factoring.fecha_emision.toISOString()).startOf("day"), "days").days;
    camposAdicionales.fecha_pago_estimado = factoring.fecha_pago_estimado;

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringpropuestaCreated = await factoringpropuestaDao.insertFactoringpropuesta(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...factoringValidated,
      ...camposAuditoria,
      ...simulacion,
    });

    logger.debug(line(), "factoringpropuestaCreated:", factoringpropuestaCreated.dataValues);

    for (let i = 0; i < simulacion?.comisiones?.length; i++) {
      const comision = simulacion.comisiones[i];
      var factoringpropuestafinanciero_comision = {
        _idfactoringpropuesta: factoringpropuestaCreated._idfactoringpropuesta,
        factoringpropuestafinancieroid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: Sequelize.fn("now", 3),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: Sequelize.fn("now", 3),
        estado: 1,
        ...comision,
      };
      const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(transaction, factoringpropuestafinanciero_comision);
      logger.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated.dataValues);
    }

    for (let i = 0; i < simulacion?.costos?.length; i++) {
      const costo = simulacion.costos[i];
      var factoringpropuestafinanciero_costo = {
        _idfactoringpropuesta: factoringpropuestaCreated._idfactoringpropuesta,
        factoringpropuestafinancieroid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: Sequelize.fn("now", 3),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: Sequelize.fn("now", 3),
        estado: 1,
        ...costo,
      };
      const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(transaction, factoringpropuestafinanciero_costo);
      logger.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated.dataValues);
    }
    for (let i = 0; i < simulacion?.gastos?.length; i++) {
      const gasto = simulacion.gastos[i];
      var factoringpropuestafinanciero_gasto = {
        _idfactoringpropuesta: factoringpropuestaCreated._idfactoringpropuesta,
        factoringpropuestafinancieroid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: Sequelize.fn("now", 3),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: Sequelize.fn("now", 3),
        estado: 1,
        ...gasto,
      };
      const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(transaction, factoringpropuestafinanciero_gasto);
      logger.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated.dataValues);
    }

    await transaction.commit();

    response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const simulateFactoringpropuesta = async (req, res) => {
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

    var factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(transaction, factoringValidated.factoringestrategiaid);
    if (!factoringestrategia) {
      logger.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    let fecha_ahora = luxon.DateTime.local();
    let fecha_fin = luxon.DateTime.fromISO(factoring.fecha_pago_estimado.toISOString());
    var dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
    var simulacion = {};
    simulacion = await simulateFactoringLogicV2(riesgooperacion._idriesgo, factoring.cuentabancaria_cuenta_bancarium._idbanco, factoring.cantidad_facturas, factoring.monto_neto, dias_pago_estimado, factoringValidated.porcentaje_financiado_estimado, factoringValidated.tdm);

    logger.info(line(), "simulacion: ", simulacion);

    await transaction.commit();

    response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
  } catch (error) {
    await safeRollback(transaction);
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
    await safeRollback(transaction);
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

    const factoringpropuestaActivated = await factoringpropuestaDao.activateFactoringpropuesta(transaction, { ...factoringpropuestaValidated, ...camposAuditoria });
    if (factoringpropuestaActivated[0] === 0) {
      throw new ClientError("Factoringpropuesta no existe", 404);
    }
    logger.debug(line(), "factoringpropuestaActivated:", factoringpropuestaActivated);
    await transaction.commit();
    response(res, 204, factoringpropuestaActivated);
  } catch (error) {
    await safeRollback(transaction);
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
    await safeRollback(transaction);
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
    await safeRollback(transaction);
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
    await safeRollback(transaction);
    throw error;
  }
};
