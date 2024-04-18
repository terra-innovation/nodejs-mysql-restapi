import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getFactoringestados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const factoringestados = await models.FactoringEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(factoringestados);
    return factoringestados;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByIdfactoringestado = async (req, idfactoringestado) => {
  try {
    const { models } = req.app.locals;

    const factoringestado = await models.FactoringEstado.findByPk(idfactoringestado, {});
    console.log(factoringestado);

    //const factoringestados = await factoringestado.getFactoringestados();
    //console.log(factoringestados);

    return factoringestado;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByFactoringestadoid = async (req, factoringestadoid) => {
  try {
    const { models } = req.app.locals;
    const factoringestado = await models.FactoringEstado.findOne({
      where: {
        factoringestadoid: factoringestadoid,
      },
    });
    //console.log(factoringestado);
    return factoringestado;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestadoPk = async (req, factoringestadoid) => {
  try {
    const { models } = req.app.locals;
    const factoringestado = await models.FactoringEstado.findOne({
      attributes: ["_idfactoringestado"],
      where: {
        factoringestadoid: factoringestadoid,
      },
    });
    //console.log(factoringestado);
    return factoringestado;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestado = async (req, factoringestado) => {
  try {
    const { models } = req.app.locals;
    const factoringestado_nuevo = await models.FactoringEstado.create(factoringestado);
    // console.log(factoringestado_nuevo);
    return factoringestado_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestado = async (req, factoringestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringEstado.update(factoringestado, {
      where: {
        factoringestadoid: factoringestado.factoringestadoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestado = async (req, factoringestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringEstado.update(factoringestado, {
      where: {
        factoringestadoid: factoringestado.factoringestadoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
