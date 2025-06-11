import * as personaDao from "#src/daos/personaDao.js";
import * as documentotipoDao from "#src/daos/documentotipoDao.js";
import * as paisDao from "#src/daos/paisDao.js";
import * as provinciaDao from "#src/daos/provinciaDao.js";
import * as distritoDao from "#src/daos/distritoDao.js";
import * as generoDao from "#src/daos/generoDao.js";
import * as personadeclaracionDao from "#src/daos/personadeclaracionDao.js";
import * as usuarioDao from "#src/daos/usuarioDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as archivopersonaDao from "#src/daos/archivopersonaDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { PersonaAttributes } from "#root/src/models/ft_factoring/Persona";

export const activatePersona = async (req, res) => {
  log.debug(line(), "controller::activatePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<PersonaAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaDeleted = await personaDao.activatePersona(transaction, { ...personaValidated, ...camposAuditoria });
    if (personaDeleted[0] === 0) {
      throw new ClientError("Persona no existe", 404);
    }
    log.debug(line(), "personaActivated:", personaDeleted);
    await transaction.commit();
    response(res, 204, personaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deletePersona = async (req, res) => {
  log.debug(line(), "controller::deletePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<PersonaAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const personaDeleted = await personaDao.deletePersona(transaction, { ...personaValidated, ...camposAuditoria });
    if (personaDeleted[0] === 0) {
      throw new ClientError("Persona no existe", 404);
    }
    log.debug(line(), "personaDeleted:", personaDeleted);
    await transaction.commit();
    response(res, 204, personaDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

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

    let personaMaster: Record<string, any> = {};
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
  log.debug(line(), "controller::updatePersona");
  const { id } = req.params;
  let NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
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
  log.debug(line(), "personaValidated:", personaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposFk = {};

    var camposAdicionales: Partial<PersonaAttributes> = {};
    camposAdicionales.personaid = personaValidated.personaid;

    var camposAuditoria: Partial<PersonaAttributes> = {};
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
  log.debug(line(), "controller::getPersonas");
  const transaction = await sequelizeFT.transaction();
  try {
    //log.info(line(),req.session_user.usuario._idusuario);

    const filter_estado = [1, 2];
    const personas = await personaDao.getPersonas(transaction, filter_estado);
    var personasJson = jsonUtils.sequelizeToJSON(personas);
    //log.info(line(),personaObfuscated);

    //var personasFiltered = jsonUtils.removeAttributes(personasJson, ["score"]);
    //personasFiltered = jsonUtils.removeAttributesPrivates(personasFiltered);
    await transaction.commit();
    response(res, 201, personasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
