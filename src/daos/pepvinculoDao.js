import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPepvinculos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const pepvinculos = await models.PepVinculo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),pepvinculos);
    return pepvinculos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (req, idpepvinculo) => {
  try {
    const { models } = req.app.locals;

    const pepvinculo = await models.PepVinculo.findByPk(idpepvinculo, {});
    logger.info(line(), pepvinculo);

    //const pepvinculos = await pepvinculo.getPepvinculos();
    //logger.info(line(),pepvinculos);

    return pepvinculo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (req, pepvinculoid) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo = await models.PepVinculo.findOne({
      where: {
        pepvinculoid: pepvinculoid,
      },
    });
    //logger.info(line(),pepvinculo);
    return pepvinculo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (req, pepvinculoid) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo = await models.PepVinculo.findOne({
      attributes: ["_idpepvinculo"],
      where: {
        pepvinculoid: pepvinculoid,
      },
    });
    //logger.info(line(),pepvinculo);
    return pepvinculo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo_nuevo = await models.PepVinculo.create(pepvinculo);
    // logger.info(line(),pepvinculo_nuevo);
    return pepvinculo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
