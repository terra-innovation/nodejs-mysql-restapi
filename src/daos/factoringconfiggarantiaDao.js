import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringconfiggarantias = async (transaction, estados) => {
  try {
    const factoringconfiggarantias = await modelsFT.FactoringConfigGarantia.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringconfiggarantias);
    return factoringconfiggarantias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByIdfactoringconfiggarantia = async (transaction, idfactoringconfiggarantia) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findByPk(idfactoringconfiggarantia, { transaction });
    logger.info(line(), factoringconfiggarantia);

    //const factoringconfiggarantias = await factoringconfiggarantia.getFactoringconfiggarantias();
    //logger.info(line(),factoringconfiggarantias);

    return factoringconfiggarantia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByFactoringconfiggarantiaid = async (transaction, factoringconfiggarantiaid) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findOne({
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfiggarantia);
    return factoringconfiggarantia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfiggarantiaPk = async (transaction, factoringconfiggarantiaid) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findOne({
      attributes: ["_idfactoringconfiggarantia"],
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfiggarantia);
    return factoringconfiggarantia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const factoringconfiggarantia_nuevo = await modelsFT.FactoringConfigGarantia.create(factoringconfiggarantia, { transaction });
    // logger.info(line(),factoringconfiggarantia_nuevo);
    return factoringconfiggarantia_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const result = await modelsFT.FactoringConfigGarantia.update(factoringconfiggarantia, {
      where: {
        factoringconfiggarantiaid: factoringconfiggarantia.factoringconfiggarantiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const result = await modelsFT.FactoringConfigGarantia.update(factoringconfiggarantia, {
      where: {
        factoringconfiggarantiaid: factoringconfiggarantia.factoringconfiggarantiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
