import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getCuentabancariaestados = async (transaction, estados) => {
  try {
    const cuentabancariaestados = await modelsFT.CuentaBancariaEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return cuentabancariaestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaestadoByIdcuentabancariaestado = async (transaction, idcuentabancariaestado) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findByPk(idcuentabancariaestado, { transaction });

    //const cuentabancariaestados = await cuentabancariaestado.getCuentabancariaestados();

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaestadoByCuentabancariaestadoid = async (transaction, cuentabancariaestadoid) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findOne({
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
      transaction,
    });

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaestadoPk = async (transaction, cuentabancariaestadoid) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findOne({
      attributes: ["_idcuentabancariaestado"],
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
      transaction,
    });

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancariaestado = async (transaction, cuentabancariaestado) => {
  try {
    const cuentabancariaestado_nuevo = await modelsFT.CuentaBancariaEstado.create(cuentabancariaestado, { transaction });

    return cuentabancariaestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancariaestado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentabancariaestado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentabancariaestado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
