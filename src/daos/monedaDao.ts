import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getMonedas = async (transaction, estados) => {
  try {
    const monedas = await modelsFT.Moneda.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return monedas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByIdmoneda = async (transaction, idmoneda) => {
  try {
    const moneda = await modelsFT.Moneda.findByPk(idmoneda, { transaction });

    //const monedas = await moneda.getMonedas();

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertMoneda = async (transaction, moneda) => {
  try {
    const moneda_nuevo = await modelsFT.Moneda.create(moneda, { transaction });

    return moneda_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
