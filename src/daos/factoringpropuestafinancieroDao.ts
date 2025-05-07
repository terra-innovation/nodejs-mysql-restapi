import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringpropuestafinancieros = async (transaction, estados) => {
  try {
    const factoringpropuestafinancieros = await modelsFT.FactoringPropuestaFinanciero.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringpropuestafinancieros;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestafinancieroByIdfactoringpropuestafinanciero = async (transaction, idfactoringpropuestafinanciero) => {
  try {
    const factoringpropuestafinanciero = await modelsFT.FactoringPropuestaFinanciero.findByPk(idfactoringpropuestafinanciero, { transaction });

    //const factoringpropuestafinancieros = await factoringpropuestafinanciero.getFactoringpropuestafinancieros();

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestafinanciero = async (transaction, factoringpropuestafinanciero) => {
  try {
    const factoringpropuestafinanciero_nuevo = await modelsFT.FactoringPropuestaFinanciero.create(factoringpropuestafinanciero, { transaction });

    return factoringpropuestafinanciero_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
