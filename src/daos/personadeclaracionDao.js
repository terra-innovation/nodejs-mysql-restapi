import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPersonadeclaracions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracions = await models.PersonaDeclaracion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),personadeclaracions);
    return personadeclaracions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByIdpersonadeclaracion = async (req, idpersonadeclaracion) => {
  try {
    const { models } = req.app.locals;

    const personadeclaracion = await models.PersonaDeclaracion.findByPk(idpersonadeclaracion, {});
    logger.info(line(), personadeclaracion);

    //const personadeclaracions = await personadeclaracion.getPersonadeclaracions();
    //logger.info(line(),personadeclaracions);

    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByPersonadeclaracionid = async (req, personadeclaracionid) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion = await models.PersonaDeclaracion.findOne({
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    //logger.info(line(),personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonadeclaracionPk = async (req, personadeclaracionid) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion = await models.PersonaDeclaracion.findOne({
      attributes: ["_idpersonadeclaracion"],
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    //logger.info(line(),personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion_nuevo = await models.PersonaDeclaracion.create(personadeclaracion);
    // logger.info(line(),personadeclaracion_nuevo);
    return personadeclaracion_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
