import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPersonadeclaracions = async (transaction, estados) => {
  try {
    const personadeclaracions = await modelsFT.PersonaDeclaracion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),personadeclaracions);
    return personadeclaracions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByIdpersonadeclaracion = async (transaction, idpersonadeclaracion) => {
  try {
    const personadeclaracion = await modelsFT.PersonaDeclaracion.findByPk(idpersonadeclaracion, { transaction });
    logger.info(line(), personadeclaracion);

    //const personadeclaracions = await personadeclaracion.getPersonadeclaracions();
    //logger.info(line(),personadeclaracions);

    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByPersonadeclaracionid = async (transaction, personadeclaracionid) => {
  try {
    const personadeclaracion = await modelsFT.PersonaDeclaracion.findOne({
      where: {
        personadeclaracionid: personadeclaracionid,
      },
      transaction,
    });
    //logger.info(line(),personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonadeclaracionPk = async (transaction, personadeclaracionid) => {
  try {
    const personadeclaracion = await modelsFT.PersonaDeclaracion.findOne({
      attributes: ["_idpersonadeclaracion"],
      where: {
        personadeclaracionid: personadeclaracionid,
      },
      transaction,
    });
    //logger.info(line(),personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonadeclaracion = async (transaction, personadeclaracion) => {
  try {
    const personadeclaracion_nuevo = await modelsFT.PersonaDeclaracion.create(personadeclaracion, { transaction });
    // logger.info(line(),personadeclaracion_nuevo);
    return personadeclaracion_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonadeclaracion = async (transaction, personadeclaracion) => {
  try {
    const result = await modelsFT.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonadeclaracion = async (transaction, personadeclaracion) => {
  try {
    const result = await modelsFT.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
