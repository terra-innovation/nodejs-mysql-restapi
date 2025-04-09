import * as personaDao from "../../daos/personaDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as personadeclaracionDao from "../../daos/personadeclaracionDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as archivoDao from "../../daos/archivoDao.js";
import * as archivopersonaDao from "../../daos/archivopersonaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { safeRollback } from "../../utils/transactionUtils.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getPersonasPendientesDeVerificacion = async (req, res) => {
  logger.debug(line(), "controller::getPersonasPendientesDeVerificacion");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const filter_estado = [1, 2];
    const filter_idpersonaverificacionestado = [2, 3, 6, 7];
    const filter_idarchivotipo = [1, 2, 3];
    const personas = await personaDao.getPersonasByIdpersonaverificacionestado(transaction, filter_estado, filter_idpersonaverificacionestado, filter_idarchivotipo);
    var personasJson = jsonUtils.sequelizeToJSON(personas);
    //logger.info(line(),personaObfuscated);

    //var personasFiltered = jsonUtils.removeAttributes(personasJson, ["score"]);
    //personasFiltered = jsonUtils.removeAttributesPrivates(personasFiltered);
    await transaction.commit();
    response(res, 201, personasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const activatePersona = async (req, res) => {
  logger.debug(line(), "controller::activatePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaDeleted = await personaDao.activatePersona(transaction, { ...personaValidated, ...camposAuditoria });
    if (personaDeleted[0] === 0) {
      throw new ClientError("Persona no existe", 404);
    }
    logger.debug(line(), "personaActivated:", personaDeleted);
    await transaction.commit();
    response(res, 204, personaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deletePersona = async (req, res) => {
  logger.debug(line(), "controller::deletePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const personaDeleted = await personaDao.deletePersona(transaction, { ...personaValidated, ...camposAuditoria });
    if (personaDeleted[0] === 0) {
      throw new ClientError("Persona no existe", 404);
    }
    logger.debug(line(), "personaDeleted:", personaDeleted);
    await transaction.commit();
    response(res, 204, personaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getPersonaMaster = async (req, res) => {
  logger.debug(line(), "controller::getPersonaMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user?.usuario?._idusuario;
    const filter_estados = [1];
    const paises = await paisDao.getPaises(transaction, filter_estados);
    const distritos = await distritoDao.getDistritos(transaction, filter_estados);
    const documentotipos = await documentotipoDao.getDocumentotipos(transaction, filter_estados);
    const generos = await generoDao.getGeneros(transaction, filter_estados);

    let personaMaster = {};
    personaMaster.paises = paises;
    personaMaster.distritos = distritos;
    personaMaster.documentotipos = documentotipos;
    personaMaster.generos = generos;

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

export const updatePersona = async (req, res) => {
  logger.debug(line(), "controller::updatePersona");
  const { id } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const personaUpdateSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
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
    })
    .required();
  const personaValidated = personaUpdateSchema.validateSync({ personaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposFk = {};

    var camposAdicionales = {};
    camposAdicionales.personaid = personaValidated.personaid;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await personaDao.updatePersona(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...personaValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Persona no existe", 404);
    }
    const personaUpdated = await personaDao.getPersonaByPersonaid(transaction, id);
    if (!personaUpdated) {
      throw new ClientError("Persona no existe", 404);
    }
    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getPersonas = async (req, res) => {
  logger.debug(line(), "controller::getPersonas");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const filter_estado = [1, 2];
    const personas = await personaDao.getPersonas(transaction, filter_estado);
    var personasJson = jsonUtils.sequelizeToJSON(personas);
    //logger.info(line(),personaObfuscated);

    //var personasFiltered = jsonUtils.removeAttributes(personasJson, ["score"]);
    //personasFiltered = jsonUtils.removeAttributesPrivates(personasFiltered);
    await transaction.commit();
    response(res, 201, personasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createPersona = async (req, res) => {
  logger.debug(line(), "controller::createPersona");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const personaCreateSchema = yup
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
  var personaValidated = personaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var personas_por_ruc = await personaDao.getPersonaByRuc(transaction, personaValidated.ruc);
    if (personas_por_ruc && personas_por_ruc.length > 0) {
      throw new ClientError("La persona [" + personaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
    }

    var camposFk = {};

    var camposAdicionales = {};
    camposAdicionales.personaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaCreated = await personaDao.insertPersona(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...personaValidated,
      ...camposAuditoria,
    });
    //logger.debug(line(),"Create persona: ID:" + personaCreated._idpersona + " | " + camposAdicionales.personaid);
    //logger.debug(line(),"personaCreated:", personaCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idpersona;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...personaValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
