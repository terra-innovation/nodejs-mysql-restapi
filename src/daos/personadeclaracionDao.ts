import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonadeclaracions = async (transaction, estados) => {
  try {
    const personadeclaracions = await modelsFT.PersonaDeclaracion.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return personadeclaracions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByIdpersonadeclaracion = async (transaction, idpersonadeclaracion) => {
  try {
    const personadeclaracion = await modelsFT.PersonaDeclaracion.findByPk(idpersonadeclaracion, { transaction });

    //const personadeclaracions = await personadeclaracion.getPersonadeclaracions();

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonadeclaracion = async (transaction, personadeclaracion) => {
  try {
    const personadeclaracion_nuevo = await modelsFT.PersonaDeclaracion.create(personadeclaracion, { transaction });

    return personadeclaracion_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
