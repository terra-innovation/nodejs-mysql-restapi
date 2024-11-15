import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getMonedas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const monedas = await models.Moneda.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),monedas);
    return monedas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByIdmoneda = async (req, idmoneda) => {
  try {
    const { models } = req.app.locals;

    const moneda = await models.Moneda.findByPk(idmoneda, {});
    logger.info(line(), moneda);

    //const monedas = await moneda.getMonedas();
    //logger.info(line(),monedas);

    return moneda;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByCodigo = async (req, codigo) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      where: {
        codigo: codigo,
      },
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByMonedaid = async (req, monedaid) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      where: {
        monedaid: monedaid,
      },
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findMonedaPk = async (req, monedaid) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      attributes: ["_idmoneda"],
      where: {
        monedaid: monedaid,
      },
    });
    //logger.info(line(),moneda);
    return moneda;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const moneda_nuevo = await models.Moneda.create(moneda);
    // logger.info(line(),moneda_nuevo);
    return moneda_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
