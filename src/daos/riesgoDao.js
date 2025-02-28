import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getRiesgos = async (transaction, estados) => {
  try {
    const riesgos = await modelsFT.Riesgo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),riesgos);
    return riesgos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByIdriesgo = async (transaction, idriesgo) => {
  try {
    const riesgo = await modelsFT.Riesgo.findByPk(idriesgo, { transaction });
    logger.info(line(), riesgo);

    //const riesgos = await riesgo.getRiesgos();
    //logger.info(line(),riesgos);

    return riesgo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByRiesgoid = async (transaction, riesgoid) => {
  try {
    const riesgo = await modelsFT.Riesgo.findOne({
      where: {
        riesgoid: riesgoid,
      },
      transaction,
    });
    //logger.info(line(),riesgo);
    return riesgo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findRiesgoPk = async (transaction, riesgoid) => {
  try {
    const riesgo = await modelsFT.Riesgo.findOne({
      attributes: ["_idriesgo"],
      where: {
        riesgoid: riesgoid,
      },
      transaction,
    });
    //logger.info(line(),riesgo);
    return riesgo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertRiesgo = async (transaction, riesgo) => {
  try {
    const riesgo_nuevo = await modelsFT.Riesgo.create(riesgo, { transaction });
    // logger.info(line(),riesgo_nuevo);
    return riesgo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateRiesgo = async (transaction, riesgo) => {
  try {
    const result = await modelsFT.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteRiesgo = async (transaction, riesgo) => {
  try {
    const result = await modelsFT.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
