import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getServicioempresaverificacions = async (transaction, estados) => {
  try {
    const servicioempresaverificacions = await modelsFT.ServicioEmpresaVerificacion.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return servicioempresaverificacions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByIdservicioempresaverificacion = async (transaction, idservicioempresaverificacion) => {
  try {
    const servicioempresaverificacion = await modelsFT.ServicioEmpresaVerificacion.findByPk(idservicioempresaverificacion, { transaction });

    //const servicioempresaverificacions = await servicioempresaverificacion.getServicioempresaverificacions();

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaverificacion = async (transaction, servicioempresaverificacion) => {
  try {
    const servicioempresaverificacion_nuevo = await modelsFT.ServicioEmpresaVerificacion.create(servicioempresaverificacion, { transaction });

    return servicioempresaverificacion_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
