import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFacturanotas = async (transaction, estados) => {
  try {
    const facturanotas = await modelsFT.FacturaNota.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),facturanotas);
    return facturanotas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByIdfacturanota = async (transaction, idfacturanota) => {
  try {
    const facturanota = await modelsFT.FacturaNota.findByPk(idfacturanota, { transaction });
    logger.info(line(), facturanota);

    //const facturanotas = await facturanota.getFacturanotas();
    //logger.info(line(),facturanotas);

    return facturanota;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByFacturanotaid = async (transaction, facturanotaid) => {
  try {
    const facturanota = await modelsFT.FacturaNota.findOne({
      where: {
        facturanotaid: facturanotaid,
      },
      transaction,
    });
    //logger.info(line(),facturanota);
    return facturanota;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturanotaPk = async (transaction, facturanotaid) => {
  try {
    const facturanota = await modelsFT.FacturaNota.findOne({
      attributes: ["_idfacturanota"],
      where: {
        facturanotaid: facturanotaid,
      },
      transaction,
    });
    //logger.info(line(),facturanota);
    return facturanota;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturanota = async (transaction, facturanota) => {
  try {
    const facturanota_nuevo = await modelsFT.FacturaNota.create(facturanota, { transaction });
    // logger.info(line(),facturanota_nuevo);
    return facturanota_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturanota = async (transaction, facturanota) => {
  try {
    const result = await modelsFT.FacturaNota.update(facturanota, {
      where: {
        facturanotaid: facturanota.facturanotaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturanota = async (transaction, facturanota) => {
  try {
    const result = await modelsFT.FacturaNota.update(facturanota, {
      where: {
        facturanotaid: facturanota.facturanotaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
