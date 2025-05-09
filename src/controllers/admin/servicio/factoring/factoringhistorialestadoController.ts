import * as factoringpropuestaDao from "#src/daos/factoringpropuestaDao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinancieroDao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestadoDao.js";
import * as factoringtipoDao from "#src/daos/factoringtipoDao.js";
import * as factoringestadoDao from "#src/daos/factoringestadoDao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategiaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestadoDao.js";
import * as archivofactoringhistorialestadoDao from "#src/daos/archivofactoringhistorialestadoDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import { FactoringHistorialEstadoAttributes } from "#src/models/ft_factoring/FactoringHistorialEstado.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";

export const updateFactoringhistorialestado = async (req, res) => {
  log.debug(line(), "controller::updateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoUpdateSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoUpdateSchema.validateSync({ factoringhistorialestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(transaction, factoringhistorialestadoValidated.factoringhistorialestadoid);
    if (!factoringhistorialestado) {
      log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk: Partial<FactoringHistorialEstadoAttributes> = {};
    camposFk._idfactoringhistorialestado = factoringhistorialestado._idfactoringhistorialestado;

    var camposAuditoria: Partial<FactoringHistorialEstadoAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const factoringhistorialestadoUpdated = await factoringhistorialestadoDao.updateFactoringhistorialestado(transaction, {
      ...camposFk,
      ...factoringhistorialestadoValidated,
      ...camposAuditoria,
    });
    log.debug(line(), "factoringhistorialestadoUpdated:", factoringhistorialestadoUpdated);

    await transaction.commit();
    response(res, 200, { ...factoringhistorialestadoValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringhistorialestadosByFactoringid = async (req, res) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  //log.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringhistorialestadoValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
    //log.info(line(),factoringpropuestaObfuscated);

    //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
    //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
    await transaction.commit();
    response(res, 201, factoringhistorialestadosJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringhistorialestadoMaster = async (req, res) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const factoringestados = await factoringestadoDao.getFactoringestados(transaction, filter_estados);

    var factoringhistorialestadosMaster: Record<string, any> = {};
    factoringhistorialestadosMaster.factoringestados = factoringestados;

    var factoringhistorialestadosMasterJSON = jsonUtils.sequelizeToJSON(factoringhistorialestadosMaster);
    //jsonUtils.prettyPrint(factoringhistorialestadosMasterJSON);
    var factoringhistorialestadosMasterObfuscated = factoringhistorialestadosMasterJSON;
    //jsonUtils.prettyPrint(factoringhistorialestadosMasterObfuscated);
    var factoringhistorialestadosMasterFiltered = jsonUtils.removeAttributesPrivates(factoringhistorialestadosMasterObfuscated);
    //jsonUtils.prettyPrint(factoringhistorialestadosMaster);
    await transaction.commit();
    response(res, 201, factoringhistorialestadosMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createFactoringhistorialestado = async (req, res) => {
  log.debug(line(), "controller::createFactoringhistorialestado");

  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringestadoid: yup.string().trim().required().min(36).max(36),
      archivos: yup.array().of(yup.string().min(36).max(36)),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  var factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringhistorialestadoValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(transaction, factoringhistorialestadoValidated.factoringestadoid);
    if (!factoringestado) {
      log.warn(line(), "Factoring estado no existe: [" + factoringhistorialestadoValidated.factoringestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    let archivos = [];
    if (factoringhistorialestadoValidated.archivos) {
      for (const archivoid of factoringhistorialestadoValidated.archivos) {
        var archivo = await archivoDao.getArchivoByArchivoid(transaction, archivoid);
        if (!archivo) {
          log.warn(line(), "Archivo no existe: [" + archivoid + "]");
          throw new ClientError("Datos no válidos", 404);
        }
        archivos.push(archivo);
      }
    }

    var camposFk: Partial<FactoringHistorialEstadoAttributes> = {};
    camposFk._idfactoring = factoring._idfactoring;
    camposFk._idfactoringestado = factoringestado._idfactoringestado;
    camposFk._idusuariomodifica = req.session_user.usuario._idusuario;

    var camposAdicionales: Partial<FactoringHistorialEstadoAttributes> = {};
    camposAdicionales.factoringhistorialestadoid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria: Partial<FactoringHistorialEstadoAttributes> = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...factoringhistorialestadoValidated,
      ...camposAuditoria,
    });

    log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated.dataValues);
    const factoringUpdate = {
      factoringid: factoringhistorialestadoValidated.factoringid,
      _idfactoringestado: factoringestado._idfactoringestado,
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
    };

    const factoringUpdated = await factoringDao.updateFactoring(transaction, factoringUpdate);

    log.debug(line(), "factoringUpdated:", factoringUpdated);

    for (const archivo of archivos) {
      const archivofactoringhistorialestadoCreate = {
        _idarchivo: archivo._idarchivo,
        _idfactoringhistorialestado: factoringhistorialestadoCreated._idfactoringhistorialestado,
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: Sequelize.fn("now", 3),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: Sequelize.fn("now", 3),
        estado: 1,
      };

      const archivofactoringhistorialestadoCreated = await archivofactoringhistorialestadoDao.insertArchivofactoringhistorialestado(transaction, {
        ...archivofactoringhistorialestadoCreate,
      });

      log.debug(line(), "archivofactoringhistorialestadoCreated:", archivofactoringhistorialestadoCreated.dataValues);
    }

    await transaction.commit();

    response(res, 201, { ...factoringhistorialestadoValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const activateFactoringhistorialestado = async (req, res) => {
  log.debug(line(), "controller::activateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringhistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(transaction, factoringhistorialestadoValidated.factoringhistorialestadoid);
    if (!factoringhistorialestado) {
      log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposAuditoria: Partial<FactoringHistorialEstadoAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringhistorialestadoActivated = await factoringhistorialestadoDao.activateFactoringhistorialestado(transaction, { ...factoringhistorialestadoValidated, ...camposAuditoria });
    log.debug(line(), "factoringhistorialestadoActivated:", factoringhistorialestadoActivated);

    await transaction.commit();
    response(res, 204, factoringhistorialestadoActivated);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteFactoringhistorialestado = async (req, res) => {
  log.debug(line(), "controller::deleteFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringhistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(transaction, factoringhistorialestadoValidated.factoringhistorialestadoid);
    if (!factoringhistorialestado) {
      log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposAuditoria: Partial<FactoringHistorialEstadoAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const factoringhistorialestadoDeleted = await factoringhistorialestadoDao.deleteFactoringhistorialestado(transaction, { ...factoringhistorialestadoValidated, ...camposAuditoria });
    log.debug(line(), "factoringhistorialestadoDeleted:", factoringhistorialestadoDeleted);

    await transaction.commit();
    response(res, 204, factoringhistorialestadoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringhistorialestados = async (req, res) => {
  log.debug(line(), "controller::getFactoringhistorialestados");
  //log.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestados(transaction, filter_estado);
    var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
    //log.info(line(),factoringhistorialestadoObfuscated);

    //var factoringhistorialestadosFiltered = jsonUtils.removeAttributes(factoringhistorialestadosJson, ["score"]);
    //factoringhistorialestadosFiltered = jsonUtils.removeAttributesPrivates(factoringhistorialestadosFiltered);
    await transaction.commit();
    response(res, 201, factoringhistorialestadosJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
