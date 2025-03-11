import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringconfigtasadescuentos = async (transaction, estados) => {
  try {
    const factoringconfigtasadescuentos = await modelsFT.FactoringConfigTasaDescuento.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringconfigtasadescuentos);
    return factoringconfigtasadescuentos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigtasadescuentoByIdfactoringconfigtasadescuento = async (transaction, idfactoringconfigtasadescuento) => {
  try {
    const factoringconfigtasadescuento = await modelsFT.FactoringConfigTasaDescuento.findByPk(idfactoringconfigtasadescuento, { transaction });
    logger.info(line(), factoringconfigtasadescuento);

    //const factoringconfigtasadescuentos = await factoringconfigtasadescuento.getFactoringconfigtasadescuentos();
    //logger.info(line(),factoringconfigtasadescuentos);

    return factoringconfigtasadescuento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigtasadescuentoByFactoringconfigtasadescuentoid = async (transaction, factoringconfigtasadescuentoid) => {
  try {
    const factoringconfigtasadescuento = await modelsFT.FactoringConfigTasaDescuento.findOne({
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfigtasadescuento);
    return factoringconfigtasadescuento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfigtasadescuentoPk = async (transaction, factoringconfigtasadescuentoid) => {
  try {
    const factoringconfigtasadescuento = await modelsFT.FactoringConfigTasaDescuento.findOne({
      attributes: ["_idfactoringconfigtasadescuento"],
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfigtasadescuento);
    return factoringconfigtasadescuento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigtasadescuento = async (transaction, factoringconfigtasadescuento) => {
  try {
    const factoringconfigtasadescuento_nuevo = await modelsFT.FactoringConfigTasaDescuento.create(factoringconfigtasadescuento, { transaction });
    // logger.info(line(),factoringconfigtasadescuento_nuevo);
    return factoringconfigtasadescuento_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfigtasadescuento = async (transaction, factoringconfigtasadescuento) => {
  try {
    const result = await modelsFT.FactoringConfigTasaDescuento.update(factoringconfigtasadescuento, {
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuento.factoringconfigtasadescuentoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfigtasadescuento = async (transaction, factoringconfigtasadescuento) => {
  try {
    const result = await modelsFT.FactoringConfigTasaDescuento.update(factoringconfigtasadescuento, {
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuento.factoringconfigtasadescuentoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
