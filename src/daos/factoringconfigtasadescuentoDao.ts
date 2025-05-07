import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringconfigtasadescuentos = async (transaction, estados) => {
  try {
    const factoringconfigtasadescuentos = await modelsFT.FactoringConfigTasaDescuento.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringconfigtasadescuentos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigtasadescuentoByIdfactoringconfigtasadescuento = async (transaction, idfactoringconfigtasadescuento) => {
  try {
    const factoringconfigtasadescuento = await modelsFT.FactoringConfigTasaDescuento.findByPk(idfactoringconfigtasadescuento, { transaction });

    //const factoringconfigtasadescuentos = await factoringconfigtasadescuento.getFactoringconfigtasadescuentos();

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigtasadescuento = async (transaction, factoringconfigtasadescuento) => {
  try {
    const factoringconfigtasadescuento_nuevo = await modelsFT.FactoringConfigTasaDescuento.create(factoringconfigtasadescuento, { transaction });

    return factoringconfigtasadescuento_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
