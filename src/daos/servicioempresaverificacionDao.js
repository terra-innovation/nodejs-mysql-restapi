import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getServicioempresaverificacions = async (transaction, estados) => {
  try {
    const servicioempresaverificacions = await modelsFT.ServicioEmpresaVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),servicioempresaverificacions);
    return servicioempresaverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByIdservicioempresaverificacion = async (transaction, idservicioempresaverificacion) => {
  try {
    const servicioempresaverificacion = await modelsFT.ServicioEmpresaVerificacion.findByPk(idservicioempresaverificacion, { transaction });
    logger.info(line(), servicioempresaverificacion);

    //const servicioempresaverificacions = await servicioempresaverificacion.getServicioempresaverificacions();
    //logger.info(line(),servicioempresaverificacions);

    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByServicioempresaverificacionid = async (transaction, servicioempresaverificacionid) => {
  try {
    const servicioempresaverificacion = await modelsFT.ServicioEmpresaVerificacion.findOne({
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresaverificacion);
    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaverificacionPk = async (transaction, servicioempresaverificacionid) => {
  try {
    const servicioempresaverificacion = await modelsFT.ServicioEmpresaVerificacion.findOne({
      attributes: ["_idservicioempresaverificacion"],
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresaverificacion);
    return servicioempresaverificacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaverificacion = async (transaction, servicioempresaverificacion) => {
  try {
    const servicioempresaverificacion_nuevo = await modelsFT.ServicioEmpresaVerificacion.create(servicioempresaverificacion, { transaction });
    // logger.info(line(),servicioempresaverificacion_nuevo);
    return servicioempresaverificacion_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaverificacion = async (transaction, servicioempresaverificacion) => {
  try {
    const result = await modelsFT.ServicioEmpresaVerificacion.update(servicioempresaverificacion, {
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaverificacion = async (transaction, servicioempresaverificacion) => {
  try {
    const result = await modelsFT.ServicioEmpresaVerificacion.update(servicioempresaverificacion, {
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
