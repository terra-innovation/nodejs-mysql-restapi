import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getRiesgos = async (transaction, estados) => {
  try {
    const riesgos = await modelsFT.Riesgo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return riesgos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByIdriesgo = async (transaction, idriesgo) => {
  try {
    const riesgo = await modelsFT.Riesgo.findByPk(idriesgo, { transaction });

    return riesgo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByRiesgoid = async (transaction, riesgoid) => {
  try {
    const riesgo = await modelsFT.Riesgo.findOne({
      where: {
        riesgoid: riesgoid,
      },
      transaction,
    });

    return riesgo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findRiesgoPk = async (transaction, riesgoid) => {
  try {
    const riesgo = await modelsFT.Riesgo.findOne({
      attributes: ["_idriesgo"],
      where: {
        riesgoid: riesgoid,
      },
      transaction,
    });

    return riesgo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertRiesgo = async (transaction, riesgo) => {
  try {
    const riesgo_nuevo = await modelsFT.Riesgo.create(riesgo, { transaction });

    return riesgo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateRiesgo = async (transaction, riesgo) => {
  try {
    const result = await modelsFT.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteRiesgo = async (transaction, riesgo) => {
  try {
    const result = await modelsFT.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
