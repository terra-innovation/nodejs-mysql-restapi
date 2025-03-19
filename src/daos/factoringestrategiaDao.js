import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringestrategias = async (transaction, estados) => {
  try {
    const factoringestrategias = await modelsFT.FactoringEstrategia.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringestrategias);
    return factoringestrategias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByIdfactoringestrategia = async (transaction, idfactoringestrategia) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findByPk(idfactoringestrategia, { transaction });
    logger.info(line(), factoringestrategia);

    //const factoringestrategias = await factoringestrategia.getFactoringestrategias();
    //logger.info(line(),factoringestrategias);

    return factoringestrategia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByFactoringestrategiaid = async (transaction, factoringestrategiaid) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findOne({
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
      transaction,
    });
    //logger.info(line(),factoringestrategia);
    return factoringestrategia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestrategiaPk = async (transaction, factoringestrategiaid) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findOne({
      attributes: ["_idfactoringestrategia"],
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
      transaction,
    });
    //logger.info(line(),factoringestrategia);
    return factoringestrategia;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const factoringestrategia_nuevo = await modelsFT.FactoringEstrategia.create(factoringestrategia, { transaction });
    // logger.info(line(),factoringestrategia_nuevo);
    return factoringestrategia_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const result = await modelsFT.FactoringEstrategia.update(factoringestrategia, {
      where: {
        factoringestrategiaid: factoringestrategia.factoringestrategiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const result = await modelsFT.FactoringEstrategia.update(factoringestrategia, {
      where: {
        factoringestrategiaid: factoringestrategia.factoringestrategiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
