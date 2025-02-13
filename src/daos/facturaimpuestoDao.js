import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFacturaimpuestos = async (transaction, estados) => {
  try {
    const facturaimpuestos = await modelsFT.FacturaImpuesto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),facturaimpuestos);
    return facturaimpuestos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByIdfacturaimpuesto = async (transaction, idfacturaimpuesto) => {
  try {
    const facturaimpuesto = await modelsFT.FacturaImpuesto.findByPk(idfacturaimpuesto, { transaction });
    logger.info(line(), facturaimpuesto);

    //const facturaimpuestos = await facturaimpuesto.getFacturaimpuestos();
    //logger.info(line(),facturaimpuestos);

    return facturaimpuesto;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByFacturaimpuestoid = async (transaction, facturaimpuestoid) => {
  try {
    const facturaimpuesto = await modelsFT.FacturaImpuesto.findOne({
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
      transaction,
    });
    //logger.info(line(),facturaimpuesto);
    return facturaimpuesto;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaimpuestoPk = async (transaction, facturaimpuestoid) => {
  try {
    const facturaimpuesto = await modelsFT.FacturaImpuesto.findOne({
      attributes: ["_idfacturaimpuesto"],
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
      transaction,
    });
    //logger.info(line(),facturaimpuesto);
    return facturaimpuesto;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaimpuesto = async (transaction, facturaimpuesto) => {
  try {
    const facturaimpuesto_nuevo = await modelsFT.FacturaImpuesto.create(facturaimpuesto, { transaction });
    // logger.info(line(),facturaimpuesto_nuevo);
    return facturaimpuesto_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaimpuesto = async (transaction, facturaimpuesto) => {
  try {
    const result = await modelsFT.FacturaImpuesto.update(facturaimpuesto, {
      where: {
        facturaimpuestoid: facturaimpuesto.facturaimpuestoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaimpuesto = async (transaction, facturaimpuesto) => {
  try {
    const result = await modelsFT.FacturaImpuesto.update(facturaimpuesto, {
      where: {
        facturaimpuestoid: facturaimpuesto.facturaimpuestoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
