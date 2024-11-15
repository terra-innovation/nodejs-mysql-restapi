import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getCuentaBancariaEstados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const cuentabancariaestados = await models.CuentaBancariaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),cuentabancariaestados);
    return cuentabancariaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentaBancariaEstadoByIdcuentabancariaestado = async (req, idcuentabancariaestado) => {
  try {
    const { models } = req.app.locals;

    const cuentabancariaestado = await models.CuentaBancariaEstado.findByPk(idcuentabancariaestado, {});
    logger.info(line(), cuentabancariaestado);

    //const cuentabancariaestados = await cuentabancariaestado.getCuentaBancariaEstados();
    //logger.info(line(),cuentabancariaestados);

    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentaBancariaEstadoByCuentaBancariaEstadoid = async (req, cuentabancariaestadoid) => {
  try {
    const { models } = req.app.locals;
    const cuentabancariaestado = await models.CuentaBancariaEstado.findOne({
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });
    //logger.info(line(),cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentaBancariaEstadoPk = async (req, cuentabancariaestadoid) => {
  try {
    const { models } = req.app.locals;
    const cuentabancariaestado = await models.CuentaBancariaEstado.findOne({
      attributes: ["_idcuentabancariaestado"],
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });
    //logger.info(line(),cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentaBancariaEstado = async (req, cuentabancariaestado) => {
  try {
    const { models } = req.app.locals;
    const cuentabancariaestado_nuevo = await models.CuentaBancariaEstado.create(cuentabancariaestado);
    // logger.info(line(),cuentabancariaestado_nuevo);
    return cuentabancariaestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentaBancariaEstado = async (req, cuentabancariaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentaBancariaEstado = async (req, cuentabancariaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentaBancariaEstado = async (req, cuentabancariaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancariaEstado.update(cuentabancariaestado, {
      where: {
        cuentabancariaestadoid: cuentabancariaestado.cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
