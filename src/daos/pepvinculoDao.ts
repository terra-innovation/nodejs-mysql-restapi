import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPepvinculos = async (transaction, estados) => {
  try {
    const pepvinculos = await modelsFT.PepVinculo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return pepvinculos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (transaction, idpepvinculo) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findByPk(idpepvinculo, { transaction });

    //const pepvinculos = await pepvinculo.getPepvinculos();

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (transaction, pepvinculoid) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findOne({
      where: {
        pepvinculoid: pepvinculoid,
      },
      transaction,
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (transaction, pepvinculoid) => {
  try {
    const pepvinculo = await modelsFT.PepVinculo.findOne({
      attributes: ["_idpepvinculo"],
      where: {
        pepvinculoid: pepvinculoid,
      },
      transaction,
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (transaction, pepvinculo) => {
  try {
    const pepvinculo_nuevo = await modelsFT.PepVinculo.create(pepvinculo, { transaction });

    return pepvinculo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (transaction, pepvinculo) => {
  try {
    const result = await modelsFT.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (transaction, pepvinculo) => {
  try {
    const result = await modelsFT.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
