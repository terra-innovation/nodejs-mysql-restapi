import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getGeneros = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const generos = await models.Genero.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),generos);
    return generos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByIdgenero = async (req, idgenero) => {
  try {
    const { models } = req.app.locals;

    const genero = await models.Genero.findByPk(idgenero, {});
    logger.info(line(), genero);

    //const generos = await genero.getGeneros();
    //logger.info(line(),generos);

    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByGeneroid = async (req, generoid) => {
  try {
    const { models } = req.app.locals;
    const genero = await models.Genero.findOne({
      where: {
        generoid: generoid,
      },
    });
    //logger.info(line(),genero);
    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findGeneroPk = async (req, generoid) => {
  try {
    const { models } = req.app.locals;
    const genero = await models.Genero.findOne({
      attributes: ["_idgenero"],
      where: {
        generoid: generoid,
      },
    });
    //logger.info(line(),genero);
    return genero;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const genero_nuevo = await models.Genero.create(genero);
    // logger.info(line(),genero_nuevo);
    return genero_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
