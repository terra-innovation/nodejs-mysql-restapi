import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getColaboradortipos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const colaboradortipos = await models.ColaboradorTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),colaboradortipos);
    return colaboradortipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByIdcolaboradortipo = async (req, idcolaboradortipo) => {
  try {
    const { models } = req.app.locals;

    const colaboradortipo = await models.ColaboradorTipo.findByPk(idcolaboradortipo, {});
    logger.info(line(), colaboradortipo);

    //const colaboradortipos = await colaboradortipo.getColaboradortipos();
    //logger.info(line(),colaboradortipos);

    return colaboradortipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByColaboradortipoid = async (req, colaboradortipoid) => {
  try {
    const { models } = req.app.locals;
    const colaboradortipo = await models.ColaboradorTipo.findOne({
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });
    //logger.info(line(),colaboradortipo);
    return colaboradortipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradortipoPk = async (req, colaboradortipoid) => {
  try {
    const { models } = req.app.locals;
    const colaboradortipo = await models.ColaboradorTipo.findOne({
      attributes: ["_idcolaboradortipo"],
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });
    //logger.info(line(),colaboradortipo);
    return colaboradortipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaboradortipo = async (req, colaboradortipo) => {
  try {
    const { models } = req.app.locals;
    const colaboradortipo_nuevo = await models.ColaboradorTipo.create(colaboradortipo);
    // logger.info(line(),colaboradortipo_nuevo);
    return colaboradortipo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaboradortipo = async (req, colaboradortipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ColaboradorTipo.update(colaboradortipo, {
      where: {
        colaboradortipoid: colaboradortipo.colaboradortipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaboradortipo = async (req, colaboradortipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ColaboradorTipo.update(colaboradortipo, {
      where: {
        colaboradortipoid: colaboradortipo.colaboradortipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
