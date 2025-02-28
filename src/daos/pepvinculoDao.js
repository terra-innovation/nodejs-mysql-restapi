import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPepvinculos = async (transaction, estados) => {
  try {
    const pepvinculos = await modelsFT.PepVinculo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),pepvinculos);
    return pepvinculos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (transaction, idpepvinculo) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findByPk(idpepvinculo, { transaction });
    logger.info(line(), pepvinculo);

    //const pepvinculos = await pepvinculo.getPepvinculos();
    //logger.info(line(),pepvinculos);

    return pepvinculo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (transaction, pepvinculoid) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findOne({
      where: {
        pepvinculoid: pepvinculoid,
      },
      transaction,
    });
    //logger.info(line(),pepvinculo);
    return pepvinculo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (transaction, pepvinculoid) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findOne({
      attributes: ["_idpepvinculo"],
      where: {
        pepvinculoid: pepvinculoid,
      },
      transaction,
    });
    //logger.info(line(),pepvinculo);
    return pepvinculo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (transaction, pepvinculo) => {
  try {
    const pepvinculo_nuevo = await modelsFT.PepVinculo.create(pepvinculo, { transaction });
    // logger.info(line(),pepvinculo_nuevo);
    return pepvinculo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (transaction, pepvinculo) => {
  try {
    const result = await modelsFT.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (transaction, pepvinculo) => {
  try {
    const result = await modelsFT.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
