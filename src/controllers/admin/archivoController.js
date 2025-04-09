import * as archivoDao from "../../daos/archivoDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { safeRollback } from "../../utils/transactionUtils.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const descargarArchivo = async (req, res) => {
  logger.debug(line(), "controller::descargarArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const archivo = await archivoDao.getArchivoByArchivoid(transaction, archivoValidated.archivoid);
    if (archivo[0] === 0) {
      throw new ClientError("Archivo no existe", 404);
    }
    logger.debug(line(), "archivo:", archivo);

    const archivoPath = path.join(storageUtils.STORAGE_PATH_SUCCESS, archivo.ruta, archivo.nombrealmacenamiento);
    // Obtener el directorio actual del archivo (como si fuera __dirname en CommonJS)
    const __filename = fileURLToPath(import.meta.url); // Convierte la URL a ruta de archivo
    const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo
    logger.debug(line(), "archivoPath:", archivoPath);
    logger.debug(line(), "__dirname:", __dirname);
    logger.debug(line(), "__filename:", __filename);

    const proyectoRutaAbsoluta = path.resolve(__dirname, "../../../");
    logger.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

    // Convierte la ruta relativa a una ruta absoluta
    const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

    await transaction.commit();

    res.sendFile(rutaAbsoluta, (err) => {
      if (err) {
        logger.error("Error al descargar el archivo:", err);
        res.status(500).send("Error");
      }
    });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const activateArchivo = async (req, res) => {
  logger.debug(line(), "controller::activateArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const archivoDeleted = await archivoDao.activateArchivo(transaction, { ...archivoValidated, ...camposAuditoria });
    if (archivoDeleted[0] === 0) {
      throw new ClientError("Archivo no existe", 404);
    }
    logger.debug(line(), "archivoActivated:", archivoDeleted);
    await transaction.commit();
    response(res, 204, archivoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteArchivo = async (req, res) => {
  logger.debug(line(), "controller::deleteArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const archivoDeleted = await archivoDao.deleteArchivo(transaction, { ...archivoValidated, ...camposAuditoria });
    if (archivoDeleted[0] === 0) {
      throw new ClientError("Archivo no existe", 404);
    }
    logger.debug(line(), "archivoDeleted:", archivoDeleted);
    await transaction.commit();
    response(res, 204, archivoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getArchivoMaster = async (req, res) => {
  logger.debug(line(), "controller::getArchivoMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user?.usuario?._idusuario;
    const filter_estados = [1];
    const paises = await paisDao.getPaises(transaction, filter_estados);
    const distritos = await distritoDao.getDistritos(transaction, filter_estados);
    const documentotipos = await documentotipoDao.getDocumentotipos(transaction, filter_estados);
    const generos = await generoDao.getGeneros(transaction, filter_estados);

    let archivoMaster = {};
    archivoMaster.paises = paises;
    archivoMaster.distritos = distritos;
    archivoMaster.documentotipos = documentotipos;
    archivoMaster.generos = generos;

    let archivoMasterJSON = jsonUtils.sequelizeToJSON(archivoMaster);
    //jsonUtils.prettyPrint(archivoMasterJSON);
    let archivoMasterObfuscated = jsonUtils.ofuscarAtributosDefault(archivoMasterJSON);
    //jsonUtils.prettyPrint(archivoMasterObfuscated);
    let archivoMasterFiltered = jsonUtils.removeAttributesPrivates(archivoMasterObfuscated);
    //jsonUtils.prettyPrint(archivoMaster);
    await transaction.commit();
    response(res, 201, archivoMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateArchivo = async (req, res) => {
  logger.debug(line(), "controller::updateArchivo");
  const { id } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const archivoUpdateSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
      archivonombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      paisnacionalidadid: yup.string().trim().required().min(36).max(36),
      paisnacimientoid: yup.string().trim().required().min(36).max(36),
      paisresidenciaid: yup.string().trim().required().min(36).max(36),
      distritoresidenciaid: yup.string().trim().required().min(36).max(36),
      generoid: yup.string().trim().required().min(36).max(36),
      fechanacimiento: yup.date().required(),
      direccion: yup.string().trim().required().max(200),
      direccionreferencia: yup.string().trim().required().max(200),
    })
    .required();
  const archivoValidated = archivoUpdateSchema.validateSync({ archivoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposFk = {};

    var camposAdicionales = {};
    camposAdicionales.archivoid = archivoValidated.archivoid;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await archivoDao.updateArchivo(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...archivoValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Archivo no existe", 404);
    }
    const archivoUpdated = await archivoDao.getArchivoByArchivoid(transaction, id);
    if (!archivoUpdated) {
      throw new ClientError("Archivo no existe", 404);
    }
    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getArchivos = async (req, res) => {
  logger.debug(line(), "controller::getArchivos");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const archivos = await archivoDao.getArchivos(transaction, filter_estado);
    var archivosJson = jsonUtils.sequelizeToJSON(archivos);
    //logger.info(line(),archivoObfuscated);

    //var archivosFiltered = jsonUtils.removeAttributes(archivosJson, ["score"]);
    //archivosFiltered = jsonUtils.removeAttributesPrivates(archivosFiltered);
    await transaction.commit();
    response(res, 201, archivosJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createArchivo = async (req, res) => {
  logger.debug(line(), "controller::createArchivo");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const archivoCreateSchema = yup
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
  var archivoValidated = archivoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var archivos_por_ruc = await archivoDao.getArchivoByRuc(transaction, archivoValidated.ruc);
    if (archivos_por_ruc && archivos_por_ruc.length > 0) {
      throw new ClientError("La archivo [" + archivoValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
    }

    var camposFk = {};

    var camposAdicionales = {};
    camposAdicionales.archivoid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const archivoCreated = await archivoDao.insertArchivo(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...archivoValidated,
      ...camposAuditoria,
    });
    //logger.debug(line(),"Create archivo: ID:" + archivoCreated._idarchivo + " | " + camposAdicionales.archivoid);
    //logger.debug(line(),"archivoCreated:", archivoCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idarchivo;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...archivoValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
