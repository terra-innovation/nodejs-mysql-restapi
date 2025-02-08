import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getCuentaBancariaEstados = async (transaction, estados) => {
  try {
    const cuentabancariaestados = await modelsFT.CuentaBancariaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),cuentabancariaestados);
    return cuentabancariaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentaBancariaEstadoByIdcuentabancariaestado = async (transaction, idcuentabancariaestado) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findByPk(idcuentabancariaestado, { transaction });
    logger.info(line(), cuentabancariaestado);

    //const cuentabancariaestados = await cuentabancariaestado.getCuentaBancariaEstados();
    //logger.info(line(),cuentabancariaestados);

    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentaBancariaEstadoByCuentaBancariaEstadoid = async (transaction, cuentabancariaestadoid) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findOne({
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
      transaction,
    });
    //logger.info(line(),cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentaBancariaEstadoPk = async (transaction, cuentabancariaestadoid) => {
  try {
    const cuentabancariaestado = await modelsFT.CuentaBancariaEstado.findOne({
      attributes: ["_idcuentabancariaestado"],
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
      transaction,
    });
    //logger.info(line(),cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentaBancariaEstado = async (transaction, cuentabancariaestado) => {
  try {
    const cuentabancariaestado_nuevo = await modelsFT.CuentaBancariaEstado.create(cuentabancariaestado, { transaction });
    // logger.info(line(),cuentabancariaestado_nuevo);
    return cuentabancariaestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentaBancariaEstado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentaBancariaEstado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentaBancariaEstado = async (transaction, cuentabancariaestado) => {
  try {
    const result = await modelsFT.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
