import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringconfigcomisionByIdriesgo = async (transaction, _idriesgo, estados) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findOne({
      where: {
        _idriesgo: _idriesgo,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisions = async (transaction, estados) => {
  try {
    const factoringconfigcomisions = await modelsFT.FactoringConfigComision.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringconfigcomisions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisionByIdfactoringconfigcomision = async (transaction, idfactoringconfigcomision) => {
  try {
    const factoringconfigcomision = await modelsFT.FactoringConfigComision.findByPk(idfactoringconfigcomision, { transaction });

    //const factoringconfigcomisions = await factoringconfigcomision.getFactoringconfigcomisions();

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigcomision = async (transaction, factoringconfigcomision) => {
  try {
    const factoringconfigcomision_nuevo = await modelsFT.FactoringConfigComision.create(factoringconfigcomision, { transaction });

    return factoringconfigcomision_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
