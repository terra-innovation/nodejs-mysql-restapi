import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFactoringpropuestafinancieros = async (transaction, estados) => {
  try {
    const factoringpropuestafinancieros = await modelsFT.FactoringPropuestaFinanciero.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringpropuestafinancieros);
    return factoringpropuestafinancieros;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestafinancieroByIdfactoringpropuestafinanciero = async (transaction, idfactoringpropuestafinanciero) => {
  try {
    const factoringpropuestafinanciero = await modelsFT.FactoringPropuestaFinanciero.findByPk(idfactoringpropuestafinanciero, { transaction });
    logger.info(line(), factoringpropuestafinanciero);

    //const factoringpropuestafinancieros = await factoringpropuestafinanciero.getFactoringpropuestafinancieros();
    //logger.info(line(),factoringpropuestafinancieros);

    return factoringpropuestafinanciero;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestafinancieroByFactoringpropuestafinancieroid = async (transaction, factoringpropuestafinancieroid) => {
  try {
    const factoringpropuestafinanciero = await modelsFT.FactoringPropuestaFinanciero.findOne({
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinancieroid,
      },
      transaction,
    });
    //logger.info(line(),factoringpropuestafinanciero);
    return factoringpropuestafinanciero;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestafinancieroPk = async (transaction, factoringpropuestafinancieroid) => {
  try {
    const factoringpropuestafinanciero = await modelsFT.FactoringPropuestaFinanciero.findOne({
      attributes: ["_idfactoringpropuestafinanciero"],
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinancieroid,
      },
      transaction,
    });
    //logger.info(line(),factoringpropuestafinanciero);
    return factoringpropuestafinanciero;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestafinanciero = async (transaction, factoringpropuestafinanciero) => {
  try {
    const factoringpropuestafinanciero_nuevo = await modelsFT.FactoringPropuestaFinanciero.create(factoringpropuestafinanciero, { transaction });
    // logger.info(line(),factoringpropuestafinanciero_nuevo);
    return factoringpropuestafinanciero_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestafinanciero = async (transaction, factoringpropuestafinanciero) => {
  try {
    const result = await modelsFT.FactoringPropuestaFinanciero.update(factoringpropuestafinanciero, {
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinanciero.factoringpropuestafinancieroid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestafinanciero = async (transaction, factoringpropuestafinanciero) => {
  try {
    const result = await modelsFT.FactoringPropuestaFinanciero.update(factoringpropuestafinanciero, {
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinanciero.factoringpropuestafinancieroid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
