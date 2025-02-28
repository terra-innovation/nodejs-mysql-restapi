import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPersonapepindirectos = async (transaction, estados) => {
  try {
    const personapepindirectos = await modelsFT.PersonaPepIndirecto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),personapepindirectos);
    return personapepindirectos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByIdpersonapepindirecto = async (transaction, idpersonapepindirecto) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findByPk(idpersonapepindirecto, { transaction });
    logger.info(line(), personapepindirecto);

    //const personapepindirectos = await personapepindirecto.getPersonapepindirectos();
    //logger.info(line(),personapepindirectos);

    return personapepindirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByPersonaPepIndirectoid = async (transaction, personapepindirectoid) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findOne({
      where: {
        personapepindirectoid: personapepindirectoid,
      },
      transaction,
    });
    //logger.info(line(),personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepIndirectoPk = async (transaction, personapepindirectoid) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findOne({
      attributes: ["_idpersonapepindirecto"],
      where: {
        personapepindirectoid: personapepindirectoid,
      },
      transaction,
    });
    //logger.info(line(),personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const personapepindirecto_nuevo = await modelsFT.PersonaPepIndirecto.create(personapepindirecto, { transaction });
    // logger.info(line(),personapepindirecto_nuevo);
    return personapepindirecto_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const result = await modelsFT.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const result = await modelsFT.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
