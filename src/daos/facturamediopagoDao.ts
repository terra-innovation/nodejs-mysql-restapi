import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturamediopagos = async (transaction, estados) => {
  try {
    const facturamediopagos = await modelsFT.FacturaMedioPago.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return facturamediopagos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByIdfacturamediopago = async (transaction, idfacturamediopago) => {
  try {
    const facturamediopago = await modelsFT.FacturaMedioPago.findByPk(idfacturamediopago, { transaction });

    //const facturamediopagos = await facturamediopago.getFacturamediopagos();

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturamediopago = async (transaction, facturamediopago) => {
  try {
    const facturamediopago_nuevo = await modelsFT.FacturaMedioPago.create(facturamediopago, { transaction });

    return facturamediopago_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
