import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFacturaterminopagos = async (transaction, estados) => {
  try {
    const facturaterminopagos = await modelsFT.FacturaTerminoPago.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),facturaterminopagos);
    return facturaterminopagos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByIdfacturaterminopago = async (transaction, idfacturaterminopago) => {
  try {
    const facturaterminopago = await modelsFT.FacturaTerminoPago.findByPk(idfacturaterminopago, { transaction });
    logger.info(line(), facturaterminopago);

    //const facturaterminopagos = await facturaterminopago.getFacturaterminopagos();
    //logger.info(line(),facturaterminopagos);

    return facturaterminopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByFacturaterminopagoid = async (transaction, facturaterminopagoid) => {
  try {
    const facturaterminopago = await modelsFT.FacturaTerminoPago.findOne({
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
      transaction,
    });
    //logger.info(line(),facturaterminopago);
    return facturaterminopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaterminopagoPk = async (transaction, facturaterminopagoid) => {
  try {
    const facturaterminopago = await modelsFT.FacturaTerminoPago.findOne({
      attributes: ["_idfacturaterminopago"],
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
      transaction,
    });
    //logger.info(line(),facturaterminopago);
    return facturaterminopago;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaterminopago = async (transaction, facturaterminopago) => {
  try {
    const facturaterminopago_nuevo = await modelsFT.FacturaTerminoPago.create(facturaterminopago, { transaction });
    // logger.info(line(),facturaterminopago_nuevo);
    return facturaterminopago_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaterminopago = async (transaction, facturaterminopago) => {
  try {
    const result = await modelsFT.FacturaTerminoPago.update(facturaterminopago, {
      where: {
        facturaterminopagoid: facturaterminopago.facturaterminopagoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaterminopago = async (transaction, facturaterminopago) => {
  try {
    const result = await modelsFT.FacturaTerminoPago.update(facturaterminopago, {
      where: {
        facturaterminopagoid: facturaterminopago.facturaterminopagoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
