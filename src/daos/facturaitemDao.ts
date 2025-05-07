import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFacturaitems = async (transaction, estados) => {
  try {
    const facturaitems = await modelsFT.FacturaItem.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return facturaitems;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaitemByIdfacturaitem = async (transaction, idfacturaitem) => {
  try {
    const facturaitem = await modelsFT.FacturaItem.findByPk(idfacturaitem, { transaction });

    //const facturaitems = await facturaitem.getFacturaitems();

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaitem = async (transaction, facturaitem) => {
  try {
    const facturaitem_nuevo = await modelsFT.FacturaItem.create(facturaitem, { transaction });

    return facturaitem_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
