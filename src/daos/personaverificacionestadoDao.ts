import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonaverificacionestados = async (transaction, estados) => {
  try {
    const personaverificacionestados = await modelsFT.PersonaVerificacionEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return personaverificacionestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByIdpersonaverificacionestado = async (transaction, idpersonaverificacionestado) => {
  try {
    const personaverificacionestado = await modelsFT.PersonaVerificacionEstado.findByPk(idpersonaverificacionestado, { transaction });

    //const personaverificacionestados = await personaverificacionestado.getPersonaverificacionestados();

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacionestado = async (transaction, personaverificacionestado) => {
  try {
    const personaverificacionestado_nuevo = await modelsFT.PersonaVerificacionEstado.create(personaverificacionestado, { transaction });

    return personaverificacionestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
