import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getServicioempresaverificacions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaverificacions = await models.ServicioEmpresaVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),servicioempresaverificacions);
    return servicioempresaverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByIdservicioempresaverificacion = async (req, idservicioempresaverificacion) => {
  try {
    const { models } = req.app.locals;

    const servicioempresaverificacion = await models.ServicioEmpresaVerificacion.findByPk(idservicioempresaverificacion, {});
    logger.info(line(), servicioempresaverificacion);

    //const servicioempresaverificacions = await servicioempresaverificacion.getServicioempresaverificacions();
    //logger.info(line(),servicioempresaverificacions);

    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByServicioempresaverificacionid = async (req, servicioempresaverificacionid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaverificacion = await models.ServicioEmpresaVerificacion.findOne({
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
    });
    //logger.info(line(),servicioempresaverificacion);
    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaverificacionPk = async (req, servicioempresaverificacionid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaverificacion = await models.ServicioEmpresaVerificacion.findOne({
      attributes: ["_idservicioempresaverificacion"],
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
    });
    //logger.info(line(),servicioempresaverificacion);
    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaverificacion = async (req, servicioempresaverificacion) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaverificacion_nuevo = await models.ServicioEmpresaVerificacion.create(servicioempresaverificacion);
    // logger.info(line(),servicioempresaverificacion_nuevo);
    return servicioempresaverificacion_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaverificacion = async (req, servicioempresaverificacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresaVerificacion.update(servicioempresaverificacion, {
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaverificacion = async (req, servicioempresaverificacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresaVerificacion.update(servicioempresaverificacion, {
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
