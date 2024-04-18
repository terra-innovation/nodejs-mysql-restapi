import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getMonedasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const monedas = await models.Moneda.findAll({
      where: {
        estado: 1,
      },
    });
    //console.log(monedas);
    return monedas;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByIdmoneda = async (req, idmoneda) => {
  try {
    const { models } = req.app.locals;

    const moneda = await models.Moneda.findByPk(idmoneda, {});
    console.log(moneda);

    //const monedas = await moneda.getMonedas();
    //console.log(monedas);

    return moneda;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByCodigo = async (req, codigo) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      where: {
        codigo: codigo,
      },
    });
    //console.log(moneda);
    return moneda;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByMonedaid = async (req, monedaid) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      where: {
        monedaid: monedaid,
      },
    });
    //console.log(moneda);
    return moneda;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findMonedaPk = async (req, monedaid) => {
  try {
    const { models } = req.app.locals;
    const moneda = await models.Moneda.findOne({
      attributes: ["_idmoneda"],
      where: {
        monedaid: monedaid,
      },
    });
    //console.log(moneda);
    return moneda;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const moneda_nuevo = await models.Moneda.create(moneda);
    // console.log(moneda_nuevo);
    return moneda_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteMoneda = async (req, moneda) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Moneda.update(moneda, {
      where: {
        monedaid: moneda.monedaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
