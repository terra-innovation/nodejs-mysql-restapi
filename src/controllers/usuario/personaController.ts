import * as personaDao from "#src/daos/personaDao.js";
import * as documentotipoDao from "#src/daos/documentotipoDao.js";
import * as paisDao from "#src/daos/paisDao.js";
import * as provinciaDao from "#src/daos/provinciaDao.js";
import * as distritoDao from "#src/daos/distritoDao.js";
import * as generoDao from "#src/daos/generoDao.js";
import * as personadeclaracionDao from "#src/daos/personadeclaracionDao.js";
import * as personaverificacionDao from "#src/daos/personaverificacionDao.js";
import * as usuarioDao from "#src/daos/usuarioDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as archivopersonaDao from "#src/daos/archivopersonaDao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestadoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { PersonaAttributes } from "#root/src/models/ft_factoring/Persona";
import { PersonaDeclaracionAttributes } from "#root/src/models/ft_factoring/PersonaDeclaracion";
import { PersonaVerificacionAttributes } from "#root/src/models/ft_factoring/PersonaVerificacion";
import { UsuarioAttributes } from "#root/src/models/ft_factoring/Usuario";

export const getPersonaMaster = async (req, res) => {
  log.debug(line(), "controller::getPersonaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user?.usuario?._idusuario;
    const filter_estados = [1];
    const paises = await paisDao.getPaises(transaction, filter_estados);
    const distritos = await distritoDao.getDistritos(transaction, filter_estados);
    const documentotipos = await documentotipoDao.getDocumentotipos(transaction, filter_estados);
    const generos = await generoDao.getGeneros(transaction, filter_estados);
    const usuario = await usuarioDao.getUsuarioByIdusuario(transaction, session_idusuario);
    const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(transaction, usuario.persona?._idpersonaverificacionestado);

    let personaMaster: Record<string, any> = {};
    personaMaster.paises = paises;
    personaMaster.distritos = distritos;
    personaMaster.documentotipos = documentotipos;
    personaMaster.generos = generos;
    personaMaster.usuario = jsonUtils.filterFields(jsonUtils.sequelizeToJSON(usuario), ["usuarioid", "email", "celular", "isemailvalidated", "ispersonavalidated"]);

    if (personaverificacionestado) {
      personaMaster.personaverificacionestado = personaverificacionestado;
    }

    let personaMasterJSON = jsonUtils.sequelizeToJSON(personaMaster);
    //jsonUtils.prettyPrint(personaMasterJSON);
    let personaMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaMasterJSON);
    //jsonUtils.prettyPrint(personaMasterObfuscated);
    let personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMasterObfuscated);
    //jsonUtils.prettyPrint(personaMaster);
    await transaction.commit();
    response(res, 201, personaMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const verifyPersona = async (req, res) => {
  log.debug(line(), "controller::verifyPersona");
  const transaction = await sequelizeFT.transaction();
  try {
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
    log.debug(line(), "personaValidated:", personaValidated);

    const documentotipo = await documentotipoDao.findDocumentotipoPk(transaction, personaValidated.documentotipoid);
    if (!documentotipo) {
      log.warn(line(), "Documento tipo no existe: [" + personaValidated.documentotipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const paisNacionalidad = await paisDao.findPaisPk(transaction, personaValidated.paisnacionalidadid);
    if (!paisNacionalidad) {
      log.warn(line(), "Nacionalidad no existe: [" + personaValidated.paisnacionalidadid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const paisNacimiento = await paisDao.findPaisPk(transaction, personaValidated.paisnacimientoid);
    if (!paisNacimiento) {
      log.warn(line(), "País de nacimiento no existe: [" + personaValidated.paisnacimientoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const paisResidencia = await paisDao.findPaisPk(transaction, personaValidated.paisresidenciaid);
    if (!paisResidencia) {
      log.warn(line(), "País de recidencia no existe: [" + personaValidated.paisresidenciaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const distritoResidencia = await distritoDao.getDistritoByDistritoid(transaction, personaValidated.distritoresidenciaid);
    if (!distritoResidencia) {
      log.warn(line(), "Distrito de recidencia no existe: [" + personaValidated.distritoresidenciaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const genero = await generoDao.findGeneroPk(transaction, personaValidated.generoid);
    if (!genero) {
      log.warn(line(), "Genero no existe: [" + personaValidated.generoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    if (!personaValidated.isdatacorrect) {
      log.warn(line(), "No aceptó los términos y condiciones");
      throw new ClientError("Datos no válidos", 404);
    }

    const persona = await personaDao.getPersonaByIdusuario(transaction, personaValidated._idusuario);
    if (persona) {
      log.warn(line(), "Persona ya existe");
      throw new ClientError("Datos no válidos", 404);
    }

    const personaverificacionestado_en_revision = 3; // 3: En revisión
    const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(transaction, personaverificacionestado_en_revision);
    if (!personaverificacionestado) {
      log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_en_revision + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const usuarioConected = await usuarioDao.getUsuarioByIdusuario(transaction, personaValidated._idusuario);
    const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(transaction, distritoResidencia._idprovincia);

    let camposFk: Partial<PersonaAttributes> = {};
    camposFk._idusuario = usuarioConected._idusuario;
    camposFk._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado; // 3: En revisión
    camposFk._iddocumentotipo = documentotipo._iddocumentotipo;
    camposFk._idpaisnacionalidad = paisNacionalidad._idpais;
    camposFk._idpaisnacimiento = paisNacimiento._idpais;
    camposFk._idpaisresidencia = paisResidencia._idpais;
    camposFk._iddepartamentoresidencia = provinciaResidencia._iddepartamento;
    camposFk._idprovinciaresidencia = distritoResidencia._idprovincia;
    camposFk._iddistritoresidencia = distritoResidencia._iddistrito;
    camposFk._idgenero = genero._idgenero;
    camposFk._iddocumentotipo = documentotipo._iddocumentotipo;

    let camposAdicionales: Partial<PersonaAttributes> = {};
    camposAdicionales.personaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];
    camposAdicionales.email = usuarioConected.email;
    camposAdicionales.celular = usuarioConected.celular;

    let camposAuditoria: Partial<PersonaAttributes> = {};
    camposAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaCreated = await personaDao.insertPersona(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...personaValidated,
      ...camposAuditoria,
    });

    //let personaCreated = { _idpersona: 4 };

    const identificacionanversoCreated = await crearIdentificacionAnverso(req, transaction, personaValidated, personaCreated);
    log.debug(line(), "identificacionanversoCreated:", identificacionanversoCreated);

    const identificacionreversoCreated = await crearIdentificacionReverso(req, transaction, personaValidated, personaCreated);
    log.debug(line(), "identificacionreversoCreated:", identificacionreversoCreated);

    const identificacionselfiCreated = await crearIdentificacionSelfi(req, transaction, personaValidated, personaCreated);
    log.debug(line(), "identificacionselfiCreated:", identificacionselfiCreated);

    const personaDeclaracionCreate: Partial<PersonaDeclaracionAttributes> = {};
    personaDeclaracionCreate.personadeclaracionid = uuidv4();
    personaDeclaracionCreate._idpersona = personaCreated._idpersona;
    personaDeclaracionCreate.espep = personaValidated.espep;
    personaDeclaracionCreate.tienevinculopep = personaValidated.tienevinculopep;
    personaDeclaracionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    personaDeclaracionCreate.fechacrea = Sequelize.fn("now", 3);
    personaDeclaracionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    personaDeclaracionCreate.fechamod = Sequelize.fn("now", 3);
    personaDeclaracionCreate.estado = 1;

    await personadeclaracionDao.insertPersonadeclaracion(transaction, personaDeclaracionCreate);

    const personaVerificacionCreate: Partial<PersonaVerificacionAttributes> = {};
    personaVerificacionCreate.personaverificacionid = uuidv4();
    personaVerificacionCreate._idpersona = personaCreated._idpersona;
    personaVerificacionCreate._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado; // 3: En revisión
    personaVerificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
    personaVerificacionCreate.comentariousuario = "";
    personaVerificacionCreate.comentariointerno = "";
    personaVerificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    personaVerificacionCreate.fechacrea = Sequelize.fn("now", 3);
    personaVerificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    personaVerificacionCreate.fechamod = Sequelize.fn("now", 3);
    personaVerificacionCreate.estado = 1;

    await personaverificacionDao.insertPersonaverificacion(transaction, personaVerificacionCreate);

    const usuarioUpdate: Partial<UsuarioAttributes> = {};
    usuarioUpdate.usuarioid = usuarioConected.usuarioid;
    usuarioUpdate.ispersonavalidated = personaverificacionestado.ispersonavalidated;
    usuarioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    usuarioUpdate.fechamod = Sequelize.fn("now", 3);
    usuarioUpdate.estado = 1;

    await usuarioDao.updateUsuario(transaction, usuarioUpdate);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

const crearIdentificacionSelfi = async (req, transaction, personaValidated, personaCreated) => {
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
  const identificacionselfiCreated = await archivoDao.insertArchivo(transaction, identificacionselfiNew);

  await archivopersonaDao.insertArchivoPersona(transaction, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
};

const crearIdentificacionReverso = async (req, transaction, personaValidated, personaCreated) => {
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
  const identificacionreversoCreated = await archivoDao.insertArchivo(transaction, identificacionreversoNew);

  await archivopersonaDao.insertArchivoPersona(transaction, {
    _idarchivo: identificacionreversoCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionreversoCreated;
};

const crearIdentificacionAnverso = async (req, transaction, personaValidated, personaCreated) => {
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
  const identificacionanversoCreated = await archivoDao.insertArchivo(transaction, identificacionanversoNew);

  await archivopersonaDao.insertArchivoPersona(transaction, {
    _idarchivo: identificacionanversoCreated._idarchivo,
    _idpersona: personaCreated._idpersona,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionanversoCreated;
};
