import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPersonapepdirectos = async (transaction, estados) => {
  try {
    const personapepdirectos = await modelsFT.PersonaPepDirecto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),personapepdirectos);
    return personapepdirectos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByIdpersonapepdirecto = async (transaction, idpersonapepdirecto) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findByPk(idpersonapepdirecto, { transaction });
    logger.info(line(), personapepdirecto);

    //const personapepdirectos = await personapepdirecto.getPersonapepdirectos();
    //logger.info(line(),personapepdirectos);

    return personapepdirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByPersonaPepDirectoid = async (transaction, personapepdirectoid) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findOne({
      where: {
        personapepdirectoid: personapepdirectoid,
      },
      transaction,
    });
    //logger.info(line(),personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepDirectoPk = async (transaction, personapepdirectoid) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findOne({
      attributes: ["_idpersonapepdirecto"],
      where: {
        personapepdirectoid: personapepdirectoid,
      },
      transaction,
    });
    //logger.info(line(),personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const personapepdirecto_nuevo = await modelsFT.PersonaPepDirecto.create(personapepdirecto, { transaction });
    // logger.info(line(),personapepdirecto_nuevo);
    return personapepdirecto_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const result = await modelsFT.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const result = await modelsFT.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
