import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPersonaverificacionestados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personaverificacionestados = await models.PersonaVerificacionEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),personaverificacionestados);
    return personaverificacionestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByIdpersonaverificacionestado = async (req, idpersonaverificacionestado) => {
  try {
    const { models } = req.app.locals;

    const personaverificacionestado = await models.PersonaVerificacionEstado.findByPk(idpersonaverificacionestado, {});
    logger.info(line(), personaverificacionestado);

    //const personaverificacionestados = await personaverificacionestado.getPersonaverificacionestados();
    //logger.info(line(),personaverificacionestados);

    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByPersonaverificacionestadoid = async (req, personaverificacionestadoid) => {
  try {
    const { models } = req.app.locals;
    const personaverificacionestado = await models.PersonaVerificacionEstado.findOne({
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });
    //logger.info(line(),personaverificacionestado);
    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionestadoPk = async (req, personaverificacionestadoid) => {
  try {
    const { models } = req.app.locals;
    const personaverificacionestado = await models.PersonaVerificacionEstado.findOne({
      attributes: ["_idpersonaverificacionestado"],
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });
    //logger.info(line(),personaverificacionestado);
    return personaverificacionestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacionestado = async (req, personaverificacionestado) => {
  try {
    const { models } = req.app.locals;
    const personaverificacionestado_nuevo = await models.PersonaVerificacionEstado.create(personaverificacionestado);
    // logger.info(line(),personaverificacionestado_nuevo);
    return personaverificacionestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacionestado = async (req, personaverificacionestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaVerificacionEstado.update(personaverificacionestado, {
      where: {
        personaverificacionestadoid: personaverificacionestado.personaverificacionestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacionestado = async (req, personaverificacionestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaVerificacionEstado.update(personaverificacionestado, {
      where: {
        personaverificacionestadoid: personaverificacionestado.personaverificacionestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
