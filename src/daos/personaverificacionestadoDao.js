import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPersonaverificacionestados = async (transaction, estados) => {
  try {
    const personaverificacionestados = await modelsFT.PersonaVerificacionEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),personaverificacionestados);
    return personaverificacionestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByIdpersonaverificacionestado = async (transaction, idpersonaverificacionestado) => {
  try {
    const personaverificacionestado = await modelsFT.PersonaVerificacionEstado.findByPk(idpersonaverificacionestado, { transaction });
    //logger.info(line(), personaverificacionestado);

    //const personaverificacionestados = await personaverificacionestado.getPersonaverificacionestados();
    //logger.info(line(),personaverificacionestados);

    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByPersonaverificacionestadoid = async (transaction, personaverificacionestadoid) => {
  try {
    const personaverificacionestado = await modelsFT.PersonaVerificacionEstado.findOne({
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
      transaction,
    });
    //logger.info(line(),personaverificacionestado);
    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionestadoPk = async (transaction, personaverificacionestadoid) => {
  try {
    const personaverificacionestado = await modelsFT.PersonaVerificacionEstado.findOne({
      attributes: ["_idpersonaverificacionestado"],
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
      transaction,
    });
    //logger.info(line(),personaverificacionestado);
    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacionestado = async (transaction, personaverificacionestado) => {
  try {
    const personaverificacionestado_nuevo = await modelsFT.PersonaVerificacionEstado.create(personaverificacionestado, { transaction });
    // logger.info(line(),personaverificacionestado_nuevo);
    return personaverificacionestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacionestado = async (transaction, personaverificacionestado) => {
  try {
    const result = await modelsFT.PersonaVerificacionEstado.update(personaverificacionestado, {
      where: {
        personaverificacionestadoid: personaverificacionestado.personaverificacionestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacionestado = async (transaction, personaverificacionestado) => {
  try {
    const result = await modelsFT.PersonaVerificacionEstado.update(personaverificacionestado, {
      where: {
        personaverificacionestadoid: personaverificacionestado.personaverificacionestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
