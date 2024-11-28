import * as personaDao from "../../daos/personaDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as personadeclaracionDao from "../../daos/personadeclaracionDao.js";
import * as personaverificacionDao from "../../daos/personaverificacionDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as archivoDao from "../../daos/archivoDao.js";
import * as archivopersonaDao from "../../daos/archivopersonaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getPersonaMaster = async (req, res) => {
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const filter_estados = [1];
  const paises = await paisDao.getPaises(req, filter_estados);
  const distritos = await distritoDao.getDistritos(req, filter_estados);
  const documentotipos = await documentotipoDao.getDocumentotipos(req, filter_estados);
  const generos = await generoDao.getGeneros(req, filter_estados);
  const usuario = await usuarioDao.getUsuarioByIdusuario(req, session_idusuario);

  let personaMaster = {};
  personaMaster.paises = paises;
  personaMaster.distritos = distritos;
  personaMaster.documentotipos = documentotipos;
  personaMaster.generos = generos;
  personaMaster.usuario = jsonUtils.filterFields(jsonUtils.sequelizeToJSON(usuario), ["usuarioid", "email", "celular", "isemailvalidated"]);

  let personaMasterJSON = jsonUtils.sequelizeToJSON(personaMaster);
  //jsonUtils.prettyPrint(personaMasterJSON);
  let personaMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaMasterJSON);
  //jsonUtils.prettyPrint(personaMasterObfuscated);
  let personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMasterObfuscated);
  //jsonUtils.prettyPrint(personaMaster);
  response(res, 201, personaMasterFiltered);
};

export const verifyPersona = async (req, res) => {
  const _idusuario = req.session_user?.usuario?._idusuario;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const personaVerifySchema = yup
    .object()
    .shape({
      _idusuario: yup.number().required(),
      identificacion_anverso: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
      identificacion_reverso: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
      identificacion_selfi: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),

      documentotipoid: yup.string().min(36).max(36).trim().required(),
      documentonumero: yup
        .string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
      personanombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
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
      tienevinculopep: yup.number().required().integer().max(1),
      espep: yup.number().required().integer().max(1),
      isdatacorrect: yup.boolean().required(),
    })
    .required();
  const personaValidated = personaVerifySchema.validateSync({ ...req.files, ...req.body, _idusuario }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaValidated:", personaValidated);

  const documentotipo = await documentotipoDao.findDocumentotipoPk(req, personaValidated.documentotipoid);
  if (!documentotipo) {
    logger.warn(line(), "Documento tipo no existe: [" + personaValidated.documentotipoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const paisNacionalidad = await paisDao.findPaisPk(req, personaValidated.paisnacionalidadid);
  if (!paisNacionalidad) {
    logger.warn(line(), "Nacionalidad no existe: [" + personaValidated.paisnacionalidadid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const paisNacimiento = await paisDao.findPaisPk(req, personaValidated.paisnacimientoid);
  if (!paisNacimiento) {
    logger.warn(line(), "País de nacimiento no existe: [" + personaValidated.paisnacimientoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const paisResidencia = await paisDao.findPaisPk(req, personaValidated.paisresidenciaid);
  if (!paisResidencia) {
    logger.warn(line(), "País de recidencia no existe: [" + personaValidated.paisresidenciaid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const distritoResidencia = await distritoDao.getDistritoByDistritoid(req, personaValidated.distritoresidenciaid);
  if (!distritoResidencia) {
    logger.warn(line(), "Distrito de recidencia no existe: [" + personaValidated.distritoresidenciaid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const genero = await generoDao.findGeneroPk(req, personaValidated.generoid);
  if (!genero) {
    logger.warn(line(), "Genero no existe: [" + personaValidated.generoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  if (!personaValidated.isdatacorrect) {
    logger.warn(line(), "No aceptó los términos y condiciones");
    throw new ClientError("Datos no válidos", 404);
  }

  const persona = await personaDao.getPersonaByIdusuario(req, personaValidated._idusuario);
  if (persona) {
    logger.warn(line(), "Persona ya existe");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioConected = await usuarioDao.getUsuarioByIdusuario(req, personaValidated._idusuario);
  const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(req, distritoResidencia._idprovincia);

  let camposFk = {};
  camposFk._idusuario = usuarioConected._idusuario;
  camposFk._iddocumentotipo = documentotipo._iddocumentotipo;
  camposFk._idpaisnacionalidad = paisNacionalidad._idpais;
  camposFk._idpaisnacimiento = paisNacimiento._idpais;
  camposFk._idpaisresidencia = paisResidencia._idpais;
  camposFk._iddepartamentoresidencia = provinciaResidencia._iddepartamento;
  camposFk._idprovinciaresidencia = distritoResidencia._idprovincia;
  camposFk._iddistritoresidencia = distritoResidencia._iddistrito;
  camposFk._idgenero = genero._idgenero;
  camposFk._iddocumentotipo = documentotipo._iddocumentotipo;

  let camposAdicionales = {};
  camposAdicionales.personaid = uuidv4();
  camposAdicionales.email = usuarioConected.email;
  camposAdicionales.celular = usuarioConected.celular;

  let camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const personaCreated = await personaDao.insertPersona(req, {
    ...camposFk,
    ...camposAdicionales,
    ...personaValidated,
    ...camposAuditoria,
  });

  //let personaCreated = { _idpersona: 4 };

  const identificacionanversoCreated = await crearIdentificacionAnverso(req, personaValidated);

  await archivopersonaDao.insertArchivoPersona(req, {
    _idarchivo: identificacionanversoCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  const identificacionreversoCreated = await crearIdentificacionReverso(req, personaValidated);

  await archivopersonaDao.insertArchivoPersona(req, {
    _idarchivo: identificacionreversoCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  const identificacionselfiCreated = await crearIdentificacionSelfi(req, personaValidated);

  await archivopersonaDao.insertArchivoPersona(req, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  const personaDeclaracionCreate = {};
  personaDeclaracionCreate.personadeclaracionid = uuidv4();
  personaDeclaracionCreate._idpersona = personaCreated._idpersona;
  personaDeclaracionCreate.espep = personaValidated.espep;
  personaDeclaracionCreate.tienevinculopep = personaValidated.tienevinculopep;
  personaDeclaracionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  personaDeclaracionCreate.fechacrea = Sequelize.fn("now", 3);
  personaDeclaracionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  personaDeclaracionCreate.fechamod = Sequelize.fn("now", 3);
  personaDeclaracionCreate.estado = 1;

  await personadeclaracionDao.insertPersonadeclaracion(req, personaDeclaracionCreate);

  const personaVerificacionCreate = {};
  personaVerificacionCreate.personaverificacionid = uuidv4();
  personaVerificacionCreate._idpersona = personaCreated._idpersona;
  personaVerificacionCreate._idpersonaverificacionestado = 2; // 2: Pendiente
  personaVerificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
  personaVerificacionCreate.comentariousuario = "";
  personaVerificacionCreate.comentariointerno = "";
  personaVerificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  personaVerificacionCreate.fechacrea = Sequelize.fn("now", 3);
  personaVerificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  personaVerificacionCreate.fechamod = Sequelize.fn("now", 3);
  personaVerificacionCreate.estado = 1;

  await personaverificacionDao.insertPersonaVerificacion(req, personaVerificacionCreate);

  const usuarioUpdate = {};
  usuarioUpdate.usuarioid = usuarioConected.usuarioid;
  usuarioUpdate._idpersonaverificacionestado = 2; // 2: Pendiente
  usuarioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  usuarioUpdate.fechamod = Sequelize.fn("now", 3);
  usuarioUpdate.estado = 1;

  await usuarioDao.updateUsuario(req, usuarioUpdate);

  response(res, 200, {});
};

const crearIdentificacionSelfi = async (req, personaValidated) => {
  //Copiamos el archivo
  const { identificacion_selfi } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_selfi[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_selfi[0];

  let identificacionselfiNew = {
    archivoid: uuidv4(),
    _idarchivotipo: 3,
    _idarchivoestado: 1,
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const identificacionselfiCreated = await archivoDao.insertArchivo(req, identificacionselfiNew);
  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
};

const crearIdentificacionReverso = async (req, personaValidated) => {
  //Copiamos el archivo
  const { identificacion_reverso } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_reverso[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_reverso[0];

  let identificacionreversoNew = {
    archivoid: uuidv4(),
    _idarchivotipo: 2,
    _idarchivoestado: 1,
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const identificacionreversoCreated = await archivoDao.insertArchivo(req, identificacionreversoNew);
  fs.unlinkSync(archivoOrigen);
  return identificacionreversoCreated;
};

const crearIdentificacionAnverso = async (req, personaValidated) => {
  //Copiamos el archivo
  const { identificacion_anverso } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_anverso[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_anverso[0];

  let identificacionanversoNew = {
    archivoid: uuidv4(),
    _idarchivotipo: 1,
    _idarchivoestado: 1,
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const identificacionanversoCreated = await archivoDao.insertArchivo(req, identificacionanversoNew);
  fs.unlinkSync(archivoOrigen);
  return identificacionanversoCreated;
};
