import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPersonaVerificacions = async (transaction, estados) => {
  try {
    const personaverificacions = await modelsFT.PersonaVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),personaverificacions);
    return personaverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaVerificacionByIdpersonaverificacion = async (transaction, idpersonaverificacion) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findByPk(idpersonaverificacion, { transaction });
    logger.info(line(), personaverificacion);

    //const personaverificacions = await personaverificacion.getPersonaVerificacions();
    //logger.info(line(),personaverificacions);

    return personaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaVerificacionByPersonaVerificacionid = async (transaction, personaverificacionid) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findOne({
      where: {
        personaverificacionid: personaverificacionid,
      },
      transaction,
    });
    //logger.info(line(),personaverificacion);
    return personaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaVerificacionPk = async (transaction, personaverificacionid) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findOne({
      attributes: ["_idpersonaverificacion"],
      where: {
        personaverificacionid: personaverificacionid,
      },
      transaction,
    });
    //logger.info(line(),personaverificacion);
    return personaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaVerificacion = async (transaction, personaverificacion) => {
  try {
    const personaverificacion_nuevo = await modelsFT.PersonaVerificacion.create(personaverificacion, { transaction });
    // logger.info(line(),personaverificacion_nuevo);
    return personaverificacion_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaVerificacion = async (transaction, personaverificacion) => {
  try {
    const result = await modelsFT.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaVerificacion = async (transaction, personaverificacion) => {
  try {
    const result = await modelsFT.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
