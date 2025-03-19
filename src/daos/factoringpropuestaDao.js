import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringpropuestasByIdfactoring = async (transaction, _idfactoring, estados) => {
  try {
    const facturas = await modelsFT.FactoringPropuesta.findAll({
      include: [{ all: true }],
      where: {
        _idfactoring: _idfactoring,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    return facturas;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestas = async (transaction, estados) => {
  try {
    const factoringpropuestas = await modelsFT.FactoringPropuesta.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringpropuestas);
    return factoringpropuestas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByIdfactoringpropuesta = async (transaction, idfactoringpropuesta) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findByPk(idfactoringpropuesta, { transaction });
    logger.info(line(), factoringpropuesta);

    //const factoringpropuestas = await factoringpropuesta.getFactoringpropuestas();
    //logger.info(line(),factoringpropuestas);

    return factoringpropuesta;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByFactoringpropuestaid = async (transaction, factoringpropuestaid) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findOne({
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
      transaction,
    });
    //logger.info(line(),factoringpropuesta);
    return factoringpropuesta;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestaPk = async (transaction, factoringpropuestaid) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findOne({
      attributes: ["_idfactoringpropuesta"],
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
      transaction,
    });
    //logger.info(line(),factoringpropuesta);
    return factoringpropuesta;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const factoringpropuesta_nuevo = await modelsFT.FactoringPropuesta.create(factoringpropuesta, { transaction });
    // logger.info(line(),factoringpropuesta_nuevo);
    return factoringpropuesta_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const result = await modelsFT.FactoringPropuesta.update(factoringpropuesta, {
      where: {
        factoringpropuestaid: factoringpropuesta.factoringpropuestaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const result = await modelsFT.FactoringPropuesta.update(factoringpropuesta, {
      where: {
        factoringpropuestaid: factoringpropuesta.factoringpropuestaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
