import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getCuentatipos = async (transaction, estados) => {
  try {
    const cuentatipos = await modelsFT.CuentaTipo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return cuentatipos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByIdcuentatipo = async (transaction, idcuentatipo) => {
  try {
    const cuentatipo = await modelsFT.CuentaTipo.findByPk(idcuentatipo, { transaction });

    //const cuentatipos = await cuentatipo.getCuentatipos();

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentatipo = async (transaction, cuentatipo) => {
  try {
    const cuentatipo_nuevo = await modelsFT.CuentaTipo.create(cuentatipo, { transaction });

    return cuentatipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
