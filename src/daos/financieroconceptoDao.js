import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getComisionFinanzaTech = async (transaction) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(transaction, 1);
};

export const getCostoCAVALI = async (transaction) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(transaction, 2);
};

export const getCostoTransaccion = async (transaction) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(transaction, 3);
};

export const getFinancieroconceptos = async (transaction, estados) => {
  try {
    const financieroconceptos = await modelsFT.FinancieroConcepto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),financieroconceptos);
    return financieroconceptos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoByIdfinancieroconcepto = async (transaction, idfinancieroconcepto) => {
  try {
    const financieroconcepto = await modelsFT.FinancieroConcepto.findByPk(idfinancieroconcepto, { transaction });
    logger.info(line(), financieroconcepto);

    //const financieroconceptos = await financieroconcepto.getFinancieroconceptos();
    //logger.info(line(),financieroconceptos);

    return financieroconcepto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoByFinancieroconceptoid = async (transaction, financieroconceptoid) => {
  try {
    const financieroconcepto = await modelsFT.FinancieroConcepto.findOne({
      where: {
        financieroconceptoid: financieroconceptoid,
      },
      transaction,
    });
    //logger.info(line(),financieroconcepto);
    return financieroconcepto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancieroconceptoPk = async (transaction, financieroconceptoid) => {
  try {
    const financieroconcepto = await modelsFT.FinancieroConcepto.findOne({
      attributes: ["_idfinancieroconcepto"],
      where: {
        financieroconceptoid: financieroconceptoid,
      },
      transaction,
    });
    //logger.info(line(),financieroconcepto);
    return financieroconcepto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancieroconcepto = async (transaction, financieroconcepto) => {
  try {
    const financieroconcepto_nuevo = await modelsFT.FinancieroConcepto.create(financieroconcepto, { transaction });
    // logger.info(line(),financieroconcepto_nuevo);
    return financieroconcepto_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancieroconcepto = async (transaction, financieroconcepto) => {
  try {
    const result = await modelsFT.FinancieroConcepto.update(financieroconcepto, {
      where: {
        financieroconceptoid: financieroconcepto.financieroconceptoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancieroconcepto = async (transaction, financieroconcepto) => {
  try {
    const result = await modelsFT.FinancieroConcepto.update(financieroconcepto, {
      where: {
        financieroconceptoid: financieroconcepto.financieroconceptoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
