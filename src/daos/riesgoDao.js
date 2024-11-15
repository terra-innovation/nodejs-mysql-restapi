import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getRiesgos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const riesgos = await models.Riesgo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),riesgos);
    return riesgos;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByIdriesgo = async (req, idriesgo) => {
  try {
    const { models } = req.app.locals;

    const riesgo = await models.Riesgo.findByPk(idriesgo, {});
    logger.info(line(), riesgo);

    //const riesgos = await riesgo.getRiesgos();
    //logger.info(line(),riesgos);

    return riesgo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByRiesgoid = async (req, riesgoid) => {
  try {
    const { models } = req.app.locals;
    const riesgo = await models.Riesgo.findOne({
      where: {
        riesgoid: riesgoid,
      },
    });
    //logger.info(line(),riesgo);
    return riesgo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findRiesgoPk = async (req, riesgoid) => {
  try {
    const { models } = req.app.locals;
    const riesgo = await models.Riesgo.findOne({
      attributes: ["_idriesgo"],
      where: {
        riesgoid: riesgoid,
      },
    });
    //logger.info(line(),riesgo);
    return riesgo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const riesgo_nuevo = await models.Riesgo.create(riesgo);
    // logger.info(line(),riesgo_nuevo);
    return riesgo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
