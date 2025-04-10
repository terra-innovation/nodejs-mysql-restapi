import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFactoringconfigcomisionByIdriesgo = async (transaction, _idriesgo, estados) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findOne({
      where: {
        _idriesgo: _idriesgo,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringconfigcomision);
    return factoringconfigcomision;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisions = async (transaction, estados) => {
  try {
    const factoringconfigcomisions = await modelsFT.FactoringConfigComision.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringconfigcomisions);
    return factoringconfigcomisions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisionByIdfactoringconfigcomision = async (transaction, idfactoringconfigcomision) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findByPk(idfactoringconfigcomision, { transaction });
    logger.info(line(), factoringconfigcomision);

    //const factoringconfigcomisions = await factoringconfigcomision.getFactoringconfigcomisions();
    //logger.info(line(),factoringconfigcomisions);

    return factoringconfigcomision;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisionByFactoringconfigcomisionid = async (transaction, factoringconfigcomisionid) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findOne({
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfigcomision);
    return factoringconfigcomision;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfigcomisionPk = async (transaction, factoringconfigcomisionid) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findOne({
      attributes: ["_idfactoringconfigcomision"],
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
      transaction,
    });
    //logger.info(line(),factoringconfigcomision);
    return factoringconfigcomision;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigcomision = async (transaction, factoringconfigcomision) => {
  try {
    const factoringconfigcomision_nuevo = await modelsFT.FactoringConfigComision.create(factoringconfigcomision, { transaction });
    // logger.info(line(),factoringconfigcomision_nuevo);
    return factoringconfigcomision_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfigcomision = async (transaction, factoringconfigcomision) => {
  try {
    const result = await modelsFT.FactoringConfigComision.update(factoringconfigcomision, {
      where: {
        factoringconfigcomisionid: factoringconfigcomision.factoringconfigcomisionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfigcomision = async (transaction, factoringconfigcomision) => {
  try {
    const result = await modelsFT.FactoringConfigComision.update(factoringconfigcomision, {
      where: {
        factoringconfigcomisionid: factoringconfigcomision.factoringconfigcomisionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
