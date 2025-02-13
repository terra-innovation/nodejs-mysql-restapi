import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFacturamediopagos = async (transaction, estados) => {
  try {
    const facturamediopagos = await modelsFT.FacturaMedioPago.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),facturamediopagos);
    return facturamediopagos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByIdfacturamediopago = async (transaction, idfacturamediopago) => {
  try {
    const facturamediopago = await modelsFT.FacturaMedioPago.findByPk(idfacturamediopago, { transaction });
    logger.info(line(), facturamediopago);

    //const facturamediopagos = await facturamediopago.getFacturamediopagos();
    //logger.info(line(),facturamediopagos);

    return facturamediopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByFacturamediopagoid = async (transaction, facturamediopagoid) => {
  try {
    const facturamediopago = await modelsFT.FacturaMedioPago.findOne({
      where: {
        facturamediopagoid: facturamediopagoid,
      },
      transaction,
    });
    //logger.info(line(),facturamediopago);
    return facturamediopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturamediopagoPk = async (transaction, facturamediopagoid) => {
  try {
    const facturamediopago = await modelsFT.FacturaMedioPago.findOne({
      attributes: ["_idfacturamediopago"],
      where: {
        facturamediopagoid: facturamediopagoid,
      },
      transaction,
    });
    //logger.info(line(),facturamediopago);
    return facturamediopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturamediopago = async (transaction, facturamediopago) => {
  try {
    const facturamediopago_nuevo = await modelsFT.FacturaMedioPago.create(facturamediopago, { transaction });
    // logger.info(line(),facturamediopago_nuevo);
    return facturamediopago_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturamediopago = async (transaction, facturamediopago) => {
  try {
    const result = await modelsFT.FacturaMedioPago.update(facturamediopago, {
      where: {
        facturamediopagoid: facturamediopago.facturamediopagoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturamediopago = async (transaction, facturamediopago) => {
  try {
    const result = await modelsFT.FacturaMedioPago.update(facturamediopago, {
      where: {
        facturamediopagoid: facturamediopago.facturamediopagoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
