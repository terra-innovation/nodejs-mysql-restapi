import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getServicios = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const servicios = await models.Servicio.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),servicios);
    return servicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByIdbanco = async (req, idbanco) => {
  try {
    const { models } = req.app.locals;

    const banco = await models.Servicio.findByPk(idbanco, {});
    logger.info(line(), banco);

    //const servicios = await banco.getServicios();
    //logger.info(line(),servicios);

    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByServicioid = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.Servicio.findOne({
      where: {
        bancoid: bancoid,
      },
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioPk = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.Servicio.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicio = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const banco_nuevo = await models.Servicio.create(banco);
    // logger.info(line(),banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicio = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Servicio.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicio = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Servicio.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
