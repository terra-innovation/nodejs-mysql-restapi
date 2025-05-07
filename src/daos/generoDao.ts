import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getGeneros = async (transaction, estados) => {
  try {
    const generos = await modelsFT.Genero.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return generos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByIdgenero = async (transaction, idgenero) => {
  try {
    const genero = await modelsFT.Genero.findByPk(idgenero, { transaction });

    //const generos = await genero.getGeneros();

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertGenero = async (transaction, genero) => {
  try {
    const genero_nuevo = await modelsFT.Genero.create(genero, { transaction });

    return genero_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
