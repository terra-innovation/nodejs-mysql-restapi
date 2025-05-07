import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFacturaimpuestos = async (transaction, estados) => {
  try {
    const facturaimpuestos = await modelsFT.FacturaImpuesto.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return facturaimpuestos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByIdfacturaimpuesto = async (transaction, idfacturaimpuesto) => {
  try {
    const facturaimpuesto = await modelsFT.FacturaImpuesto.findByPk(idfacturaimpuesto, { transaction });

    //const facturaimpuestos = await facturaimpuesto.getFacturaimpuestos();

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaimpuesto = async (transaction, facturaimpuesto) => {
  try {
    const facturaimpuesto_nuevo = await modelsFT.FacturaImpuesto.create(facturaimpuesto, { transaction });

    return facturaimpuesto_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
