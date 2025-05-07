import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonaverificacions = async (transaction, estados) => {
  try {
    const personaverificacions = await modelsFT.PersonaVerificacion.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return personaverificacions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByIdpersonaverificacion = async (transaction, idpersonaverificacion) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findByPk(idpersonaverificacion, { transaction });

    //const personaverificacions = await personaverificacion.getPersonaverificacions();

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByPersonaverificacionid = async (transaction, personaverificacionid) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findOne({
      where: {
        personaverificacionid: personaverificacionid,
      },
      transaction,
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionPk = async (transaction, personaverificacionid) => {
  try {
    const personaverificacion = await modelsFT.PersonaVerificacion.findOne({
      attributes: ["_idpersonaverificacion"],
      where: {
        personaverificacionid: personaverificacionid,
      },
      transaction,
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacion = async (transaction, personaverificacion) => {
  try {
    const personaverificacion_nuevo = await modelsFT.PersonaVerificacion.create(personaverificacion, { transaction });

    return personaverificacion_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacion = async (transaction, personaverificacion) => {
  try {
    const result = await modelsFT.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacion = async (transaction, personaverificacion) => {
  try {
    const result = await modelsFT.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersonaverificacion = async (transaction, personaverificacion) => {
  try {
    const result = await modelsFT.PersonaVerificacion.update(personaverificacion, {
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
