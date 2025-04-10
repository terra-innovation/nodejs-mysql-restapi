import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getComision = async (transaction) => {
  return await getFinancierotipoByIdfinancierotipo(transaction, 1);
};

export const getCosto = async (transaction) => {
  return await getFinancierotipoByIdfinancierotipo(transaction, 2);
};

export const getGasto = async (transaction) => {
  return await getFinancierotipoByIdfinancierotipo(transaction, 3);
};

export const getFinancierotipos = async (transaction, estados) => {
  try {
    const financierotipos = await modelsFT.FinancieroTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),financierotipos);
    return financierotipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByIdfinancierotipo = async (transaction, idfinancierotipo) => {
  try {
    const financierotipo = await modelsFT.FinancieroTipo.findByPk(idfinancierotipo, { transaction });
    logger.info(line(), financierotipo);

    //const financierotipos = await financierotipo.getFinancierotipos();
    //logger.info(line(),financierotipos);

    return financierotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByFinancierotipoid = async (transaction, financierotipoid) => {
  try {
    const financierotipo = await modelsFT.FinancieroTipo.findOne({
      where: {
        financierotipoid: financierotipoid,
      },
      transaction,
    });
    //logger.info(line(),financierotipo);
    return financierotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancierotipoPk = async (transaction, financierotipoid) => {
  try {
    const financierotipo = await modelsFT.FinancieroTipo.findOne({
      attributes: ["_idfinancierotipo"],
      where: {
        financierotipoid: financierotipoid,
      },
      transaction,
    });
    //logger.info(line(),financierotipo);
    return financierotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancierotipo = async (transaction, financierotipo) => {
  try {
    const financierotipo_nuevo = await modelsFT.FinancieroTipo.create(financierotipo, { transaction });
    // logger.info(line(),financierotipo_nuevo);
    return financierotipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancierotipo = async (transaction, financierotipo) => {
  try {
    const result = await modelsFT.FinancieroTipo.update(financierotipo, {
      where: {
        financierotipoid: financierotipo.financierotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancierotipo = async (transaction, financierotipo) => {
  try {
    const result = await modelsFT.FinancieroTipo.update(financierotipo, {
      where: {
        financierotipoid: financierotipo.financierotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
