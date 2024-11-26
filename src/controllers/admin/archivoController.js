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
import * as storageUtils from "../../utils/storageUtils.js";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const descargarArchivo = async (req, res) => {
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  const archivo = await archivoDao.getArchivoByArchivoid(req, archivoValidated.archivoid);
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

  res.sendFile(rutaAbsoluta, (err) => {
    if (err) {
      logger.error("Error al cargar la imagen:", err);
      res.status(404).send("Imagen no encontrada");
    }
  });
};

export const activateArchivo = async (req, res) => {
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const archivoDeleted = await archivoDao.activateArchivo(req, { ...archivoValidated, ...camposAuditoria });
  if (archivoDeleted[0] === 0) {
    throw new ClientError("Archivo no existe", 404);
  }
  logger.debug(line(), "archivoActivated:", archivoDeleted);
  response(res, 204, archivoDeleted);
};

export const deleteArchivo = async (req, res) => {
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "archivoValidated:", archivoValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const archivoDeleted = await archivoDao.deleteArchivo(req, { ...archivoValidated, ...camposAuditoria });
  if (archivoDeleted[0] === 0) {
    throw new ClientError("Archivo no existe", 404);
  }
  logger.debug(line(), "archivoDeleted:", archivoDeleted);
  response(res, 204, archivoDeleted);
};

export const getArchivoMaster = async (req, res) => {
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const filter_estados = [1];
  const paises = await paisDao.getPaises(req, filter_estados);
  const distritos = await distritoDao.getDistritos(req, filter_estados);
  const documentotipos = await documentotipoDao.getDocumentotipos(req, filter_estados);
  const generos = await generoDao.getGeneros(req, filter_estados);

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
  response(res, 201, archivoMasterFiltered);
};

export const updateArchivo = async (req, res) => {
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

  var camposFk = {};

  var camposAdicionales = {};
  camposAdicionales.archivoid = archivoValidated.archivoid;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await archivoDao.updateArchivo(req, {
    ...camposFk,
    ...camposAdicionales,
    ...archivoValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Archivo no existe", 404);
  }
  const archivoUpdated = await archivoDao.getArchivoByArchivoid(req, id);
  if (!archivoUpdated) {
    throw new ClientError("Archivo no existe", 404);
  }
  response(res, 200, {});
};

export const getArchivos = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estado = [1, 2];
  const archivos = await archivoDao.getArchivos(req, filter_estado);
  var archivosJson = jsonUtils.sequelizeToJSON(archivos);
  //logger.info(line(),archivoObfuscated);

  //var archivosFiltered = jsonUtils.removeAttributes(archivosJson, ["score"]);
  //archivosFiltered = jsonUtils.removeAttributesPrivates(archivosFiltered);
  response(res, 201, archivosJson);
};

export const createArchivo = async (req, res) => {
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

  var archivos_por_ruc = await archivoDao.getArchivoByRuc(req, archivoValidated.ruc);
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

  const archivoCreated = await archivoDao.insertArchivo(req, {
    ...camposFk,
    ...camposAdicionales,
    ...archivoValidated,
    ...camposAuditoria,
  });
  //logger.debug(line(),"Create archivo: ID:" + archivoCreated._idarchivo + " | " + camposAdicionales.archivoid);
  //logger.debug(line(),"archivoCreated:", archivoCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idarchivo;
  response(res, 201, { ...camposAdicionales, ...archivoValidated });
};
