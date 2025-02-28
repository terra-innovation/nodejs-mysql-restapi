import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getMonedas = async (transaction, estados) => {
  try {
    const monedas = await modelsFT.Moneda.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),monedas);
    return monedas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByIdmoneda = async (transaction, idmoneda) => {
  try {
    const moneda = await modelsFT.Moneda.findByPk(idmoneda, { transaction });
    logger.info(line(), moneda);

    //const monedas = await moneda.getMonedas();
    //logger.info(line(),monedas);

    return moneda;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByCodigo = async (transaction, codigo) => {
  try {
    const moneda = await modelsFT.Moneda.findOne({
      where: {
        codigo: codigo,
      },
      transaction,
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByMonedaid = async (transaction, monedaid) => {
  try {
    const moneda = await modelsFT.Moneda.findOne({
      where: {
        monedaid: monedaid,
      },
      transaction,
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findMonedaPk = async (transaction, monedaid) => {
  try {
    const moneda = await modelsFT.Moneda.findOne({
      attributes: ["_idmoneda"],
      where: {
        monedaid: monedaid,
      },
      transaction,
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertMoneda = async (transaction, moneda) => {
  try {
    const moneda_nuevo = await modelsFT.Moneda.create(moneda, { transaction });
    // logger.info(line(),moneda_nuevo);
    return moneda_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateMoneda = async (transaction, moneda) => {
  try {
    const result = await modelsFT.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteMoneda = async (transaction, moneda) => {
  try {
    const result = await modelsFT.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
