import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getGeneros = async (transaction, estados) => {
  try {
    const generos = await modelsFT.Genero.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),generos);
    return generos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByIdgenero = async (transaction, idgenero) => {
  try {
    const genero = await modelsFT.Genero.findByPk(idgenero, { transaction });
    logger.info(line(), genero);

    //const generos = await genero.getGeneros();
    //logger.info(line(),generos);

    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByGeneroid = async (transaction, generoid) => {
  try {
    const genero = await modelsFT.Genero.findOne({
      where: {
        generoid: generoid,
      },
      transaction,
    });
    //logger.info(line(),genero);
    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findGeneroPk = async (transaction, generoid) => {
  try {
    const genero = await modelsFT.Genero.findOne({
      attributes: ["_idgenero"],
      where: {
        generoid: generoid,
      },
      transaction,
    });
    //logger.info(line(),genero);
    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertGenero = async (transaction, genero) => {
  try {
    const genero_nuevo = await modelsFT.Genero.create(genero, { transaction });
    // logger.info(line(),genero_nuevo);
    return genero_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateGenero = async (transaction, genero) => {
  try {
    const result = await modelsFT.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteGenero = async (transaction, genero) => {
  try {
    const result = await modelsFT.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
