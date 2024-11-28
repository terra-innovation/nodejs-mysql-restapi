import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPersonaVerificacions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personaverificacions = await models.PersonaVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),personaverificacions);
    return personaverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaVerificacionByIdpersonaverificacion = async (req, idpersonaverificacion) => {
  try {
    const { models } = req.app.locals;

    const personaverificacion = await models.PersonaVerificacion.findByPk(idpersonaverificacion, {});
    logger.info(line(), personaverificacion);

    //const personaverificacions = await personaverificacion.getPersonaVerificacions();
    //logger.info(line(),personaverificacions);

    return personaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaVerificacionByPersonaVerificacionid = async (req, personaverificacionid) => {
  try {
    const { models } = req.app.locals;
    const personaverificacion = await models.PersonaVerificacion.findOne({
      where: {
        personaverificacionid: personaverificacionid,
      },
    });
    //logger.info(line(),personaverificacion);
    return personaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaVerificacionPk = async (req, personaverificacionid) => {
  try {
    const { models } = req.app.locals;
    const personaverificacion = await models.PersonaVerificacion.findOne({
      attributes: ["_idpersonaverificacion"],
      where: {
        personaverificacionid: personaverificacionid,
      },
    });
    //logger.info(line(),personaverificacion);
    return personaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaVerificacion = async (req, personaverificacion) => {
  try {
    const { models } = req.app.locals;
    const personaverificacion_nuevo = await models.PersonaVerificacion.create(personaverificacion);
    // logger.info(line(),personaverificacion_nuevo);
    return personaverificacion_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaVerificacion = async (req, personaverificacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaVerificacion = async (req, personaverificacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
