import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFacturaitems = async (transaction, estados) => {
  try {
    const facturaitems = await modelsFT.FacturaItem.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),facturaitems);
    return facturaitems;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaitemByIdfacturaitem = async (transaction, idfacturaitem) => {
  try {
    const facturaitem = await modelsFT.FacturaItem.findByPk(idfacturaitem, { transaction });
    logger.info(line(), facturaitem);

    //const facturaitems = await facturaitem.getFacturaitems();
    //logger.info(line(),facturaitems);

    return facturaitem;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaitemByFacturaitemid = async (transaction, facturaitemid) => {
  try {
    const facturaitem = await modelsFT.FacturaItem.findOne({
      where: {
        facturaitemid: facturaitemid,
      },
      transaction,
    });
    //logger.info(line(),facturaitem);
    return facturaitem;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaitemPk = async (transaction, facturaitemid) => {
  try {
    const facturaitem = await modelsFT.FacturaItem.findOne({
      attributes: ["_idfacturaitem"],
      where: {
        facturaitemid: facturaitemid,
      },
      transaction,
    });
    //logger.info(line(),facturaitem);
    return facturaitem;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaitem = async (transaction, facturaitem) => {
  try {
    const facturaitem_nuevo = await modelsFT.FacturaItem.create(facturaitem, { transaction });
    // logger.info(line(),facturaitem_nuevo);
    return facturaitem_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaitem = async (transaction, facturaitem) => {
  try {
    const result = await modelsFT.FacturaItem.update(facturaitem, {
      where: {
        facturaitemid: facturaitem.facturaitemid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaitem = async (transaction, facturaitem) => {
  try {
    const result = await modelsFT.FacturaItem.update(facturaitem, {
      where: {
        facturaitemid: facturaitem.facturaitemid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
