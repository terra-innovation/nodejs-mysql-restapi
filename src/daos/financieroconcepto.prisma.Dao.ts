import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return financieroconceptos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoByIdfinancieroconcepto = async (transaction, idfinancieroconcepto) => {
  try {
    const financieroconcepto = await modelsFT.FinancieroConcepto.findByPk(idfinancieroconcepto, { transaction });

    //const financieroconceptos = await financieroconcepto.getFinancieroconceptos();

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancieroconcepto = async (transaction, financieroconcepto) => {
  try {
    const financieroconcepto_nuevo = await modelsFT.FinancieroConcepto.create(financieroconcepto, { transaction });

    return financieroconcepto_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
