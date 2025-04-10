import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getCuentatipos = async (transaction, estados) => {
  try {
    const cuentatipos = await modelsFT.CuentaTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),cuentatipos);
    return cuentatipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByIdcuentatipo = async (transaction, idcuentatipo) => {
  try {
    const cuentatipo = await modelsFT.CuentaTipo.findByPk(idcuentatipo, { transaction });
    logger.info(line(), cuentatipo);

    //const cuentatipos = await cuentatipo.getCuentatipos();
    //logger.info(line(),cuentatipos);

    return cuentatipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByCuentatipoid = async (transaction, cuentatipoid) => {
  try {
    const cuentatipo = await modelsFT.CuentaTipo.findOne({
      where: {
        cuentatipoid: cuentatipoid,
      },
      transaction,
    });
    //logger.info(line(),cuentatipo);
    return cuentatipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentatipoPk = async (transaction, cuentatipoid) => {
  try {
    const cuentatipo = await modelsFT.CuentaTipo.findOne({
      attributes: ["_idcuentatipo"],
      where: {
        cuentatipoid: cuentatipoid,
      },
      transaction,
    });
    //logger.info(line(),cuentatipo);
    return cuentatipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentatipo = async (transaction, cuentatipo) => {
  try {
    const cuentatipo_nuevo = await modelsFT.CuentaTipo.create(cuentatipo, { transaction });
    // logger.info(line(),cuentatipo_nuevo);
    return cuentatipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentatipo = async (transaction, cuentatipo) => {
  try {
    const result = await modelsFT.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentatipo = async (transaction, cuentatipo) => {
  try {
    const result = await modelsFT.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
