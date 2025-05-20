import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturaterminopagos = async (transaction, estados) => {
  try {
    const facturaterminopagos = await modelsFT.FacturaTerminoPago.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return facturaterminopagos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByIdfacturaterminopago = async (transaction, idfacturaterminopago) => {
  try {
    const facturaterminopago = await modelsFT.FacturaTerminoPago.findByPk(idfacturaterminopago, { transaction });

    //const facturaterminopagos = await facturaterminopago.getFacturaterminopagos();

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaterminopago = async (transaction, facturaterminopago) => {
  try {
    const facturaterminopago_nuevo = await modelsFT.FacturaTerminoPago.create(facturaterminopago, { transaction });

    return facturaterminopago_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
