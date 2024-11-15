import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringtipos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const factoringtipos = await models.FactoringTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),factoringtipos);
    return factoringtipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByIdfactoringtipo = async (req, idfactoringtipo) => {
  try {
    const { models } = req.app.locals;

    const factoringtipo = await models.FactoringTipo.findByPk(idfactoringtipo, {});
    logger.info(line(), factoringtipo);

    //const factoringtipos = await factoringtipo.getFactoringtipos();
    //logger.info(line(),factoringtipos);

    return factoringtipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByFactoringtipoid = async (req, factoringtipoid) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo = await models.FactoringTipo.findOne({
      where: {
        factoringtipoid: factoringtipoid,
      },
    });
    //logger.info(line(),factoringtipo);
    return factoringtipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtipoPk = async (req, factoringtipoid) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo = await models.FactoringTipo.findOne({
      attributes: ["_idfactoringtipo"],
      where: {
        factoringtipoid: factoringtipoid,
      },
    });
    //logger.info(line(),factoringtipo);
    return factoringtipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo_nuevo = await models.FactoringTipo.create(factoringtipo);
    // logger.info(line(),factoringtipo_nuevo);
    return factoringtipo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
