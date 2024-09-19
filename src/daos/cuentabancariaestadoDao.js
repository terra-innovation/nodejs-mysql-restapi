import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(cuentabancariaestados);
    return cuentabancariaestados;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentaBancariaEstadoByIdcuentabancariaestado = async (req, idcuentabancariaestado) => {
  try {
    const { models } = req.app.locals;

    const cuentabancariaestado = await models.CuentaBancariaEstado.findByPk(idcuentabancariaestado, {});
    console.log(cuentabancariaestado);

    //const cuentabancariaestados = await cuentabancariaestado.getCuentaBancariaEstados();
    //console.log(cuentabancariaestados);

    return cuentabancariaestado;
  } catch (error) {
    console.error(error);
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
    //console.log(cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    console.error(error);
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
    //console.log(cuentabancariaestado);
    return cuentabancariaestado;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentaBancariaEstado = async (req, cuentabancariaestado) => {
  try {
    const { models } = req.app.locals;
    const cuentabancariaestado_nuevo = await models.CuentaBancariaEstado.create(cuentabancariaestado);
    // console.log(cuentabancariaestado_nuevo);
    return cuentabancariaestado_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
