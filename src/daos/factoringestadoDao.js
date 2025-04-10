import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFactoringestados = async (transaction, estados) => {
  try {
    const factoringestados = await modelsFT.FactoringEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringestados);
    return factoringestados;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByIdfactoringestado = async (transaction, idfactoringestado) => {
  try {
    const factoringestado = await modelsFT.FactoringEstado.findByPk(idfactoringestado, { transaction });
    logger.info(line(), factoringestado);

    //const factoringestados = await factoringestado.getFactoringestados();
    //logger.info(line(),factoringestados);

    return factoringestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByFactoringestadoid = async (transaction, factoringestadoid) => {
  try {
    const factoringestado = await modelsFT.FactoringEstado.findOne({
      where: {
        factoringestadoid: factoringestadoid,
      },
      transaction,
    });
    //logger.info(line(),factoringestado);
    return factoringestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestadoPk = async (transaction, factoringestadoid) => {
  try {
    const factoringestado = await modelsFT.FactoringEstado.findOne({
      attributes: ["_idfactoringestado"],
      where: {
        factoringestadoid: factoringestadoid,
      },
      transaction,
    });
    //logger.info(line(),factoringestado);
    return factoringestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestado = async (transaction, factoringestado) => {
  try {
    const factoringestado_nuevo = await modelsFT.FactoringEstado.create(factoringestado, { transaction });
    // logger.info(line(),factoringestado_nuevo);
    return factoringestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestado = async (transaction, factoringestado) => {
  try {
    const result = await modelsFT.FactoringEstado.update(factoringestado, {
      where: {
        factoringestadoid: factoringestado.factoringestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestado = async (transaction, factoringestado) => {
  try {
    const result = await modelsFT.FactoringEstado.update(factoringestado, {
      where: {
        factoringestadoid: factoringestado.factoringestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
