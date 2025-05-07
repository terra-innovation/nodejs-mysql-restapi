import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringconfiggarantias = async (transaction, estados) => {
  try {
    const factoringconfiggarantias = await modelsFT.FactoringConfigGarantia.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringconfiggarantias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByIdfactoringconfiggarantia = async (transaction, idfactoringconfiggarantia) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findByPk(idfactoringconfiggarantia, { transaction });

    //const factoringconfiggarantias = await factoringconfiggarantia.getFactoringconfiggarantias();

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByFactoringconfiggarantiaid = async (transaction, factoringconfiggarantiaid) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findOne({
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
      transaction,
    });

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfiggarantiaPk = async (transaction, factoringconfiggarantiaid) => {
  try {
    const factoringconfiggarantia = await modelsFT.FactoringConfigGarantia.findOne({
      attributes: ["_idfactoringconfiggarantia"],
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
      transaction,
    });

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const factoringconfiggarantia_nuevo = await modelsFT.FactoringConfigGarantia.create(factoringconfiggarantia, { transaction });

    return factoringconfiggarantia_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const result = await modelsFT.FactoringConfigGarantia.update(factoringconfiggarantia, {
      where: {
        factoringconfiggarantiaid: factoringconfiggarantia.factoringconfiggarantiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfiggarantia = async (transaction, factoringconfiggarantia) => {
  try {
    const result = await modelsFT.FactoringConfigGarantia.update(factoringconfiggarantia, {
      where: {
        factoringconfiggarantiaid: factoringconfiggarantia.factoringconfiggarantiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
