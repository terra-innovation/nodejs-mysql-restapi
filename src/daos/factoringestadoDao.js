import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

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
    //logger.info(line(),factoringestados);
    return factoringestados;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByIdfactoringestado = async (req, idfactoringestado) => {
  try {
    const { models } = req.app.locals;

    const factoringestado = await models.FactoringEstado.findByPk(idfactoringestado, {});
    logger.info(line(), factoringestado);

    //const factoringestados = await factoringestado.getFactoringestados();
    //logger.info(line(),factoringestados);

    return factoringestado;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),factoringestado);
    return factoringestado;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),factoringestado);
    return factoringestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestado = async (req, factoringestado) => {
  try {
    const { models } = req.app.locals;
    const factoringestado_nuevo = await models.FactoringEstado.create(factoringestado);
    // logger.info(line(),factoringestado_nuevo);
    return factoringestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
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
    logger.error(line(), error);
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
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
