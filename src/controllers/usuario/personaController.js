import * as personaDao from "../../daos/personaDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as departamentoDao from "../../daos/departamentoDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as archivoDao from "../../daos/archivoDao.js";
import * as archivopersonaDao from "../../daos/archivopersonaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getPersonaMaster = async (req, res) => {
  const filter_estados = [1];
  const paisnacionalidades = await paisDao.getPaises(req, filter_estados);
  const paisnacimientos = await paisDao.getPaises(req, filter_estados);
  const paisresidencias = await paisDao.getPaises(req, filter_estados);
  const documentotipos = await documentotipoDao.getDocumentotipos(req, filter_estados);
  const generos = await generoDao.getGeneros(req, filter_estados);

  var personaMaster = {};
  personaMaster.paisnacionalidades = paisnacionalidades;
  personaMaster.paisnacimientos = paisnacimientos;
  personaMaster.paisresidencias = paisresidencias;
  personaMaster.paises = paisresidencias;
  personaMaster.documentotipos = documentotipos;
  personaMaster.generos = generos;

  var personaMasterJSON = jsonUtils.sequelizeToJSON(personaMaster);
  //jsonUtils.prettyPrint(personaMasterJSON);
  var personaMasterObfuscated = personaMasterJSON;
  //jsonUtils.prettyPrint(personaMasterObfuscated);
  var personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMasterObfuscated);
  //jsonUtils.prettyPrint(personaMaster);
  response(res, 201, personaMasterFiltered);
};

export const verifyPersona = async (req, res) => {
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
      paisnacionalidadid: yup.string().min(36).max(36).trim().required(),
      paisnacimientoid: yup.string().min(36).max(36).trim().required(),
      paisresidenciaid: yup.string().min(36).max(36).trim().required(),
      distritoresidenciaid: yup.string().min(36).max(36).trim().required(),
      generoid: yup.string().min(36).max(36).trim().required(),
      fechanacimiento: yup.date().required(),
      direccion: yup.string().trim().max(200).required(),
    })
    .required();
  const personaValidated = personaVerifySchema.validateSync({ ...req.files, ...req.body, _idusuario: req.session_user?.usuario?._idusuario }, { abortEarly: false, stripUnknown: true });
  console.debug("personaValidated:", personaValidated);

  const documentotipo = await documentotipoDao.findDocumentotipoPk(req, personaValidated.documentotipoid);
  if (!documentotipo) {
    throw new ClientError("Documento tipo no existe", 404);
  }
  const paisNacionalidad = await paisDao.findPaisPk(req, personaValidated.paisnacionalidadid);
  if (!paisNacionalidad) {
    throw new ClientError("Nacionalidad no existe", 404);
  }
  const paisNacimiento = await paisDao.findPaisPk(req, personaValidated.paisnacimientoid);
  if (!paisNacimiento) {
    throw new ClientError("País de nacimiento no existe", 404);
  }
  const paisResidencia = await paisDao.findPaisPk(req, personaValidated.paisresidenciaid);
  if (!paisResidencia) {
    throw new ClientError("País de recidencia no existe", 404);
  }
  const distritoResidencia = await distritoDao.getDistritoByDistritoid(req, personaValidated.distritoresidenciaid);
  if (!distritoResidencia) {
    throw new ClientError("Distrito de recidencia no existe", 404);
  }
  const genero = await generoDao.findGeneroPk(req, personaValidated.generoid);
  if (!genero) {
    throw new ClientError("Genero no existe", 404);
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

  /*const personaCreated = await personaDao.insertPersona(req, {
    ...camposFk,
    ...camposAdicionales,
    ...personaValidated,
    ...camposAuditoria,
  });
  */

  let personaCreated = { _idpersona: 4 };

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
