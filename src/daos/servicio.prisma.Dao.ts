import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getServicios = async (transaction, estados) => {
  try {
    const servicios = await modelsFT.Servicio.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return servicios;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByIdservicio = async (transaction, idservicio) => {
  try {
    const servicio = await modelsFT.Servicio.findByPk(idservicio, { transaction });

    //const servicios = await servicio.getServicios();

    return servicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByServicioid = async (transaction, servicioid) => {
  try {
    const servicio = await modelsFT.Servicio.findOne({
      where: {
        servicioid: servicioid,
      },
      transaction,
    });

    return servicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioPk = async (transaction, servicioid) => {
  try {
    const servicio = await modelsFT.Servicio.findOne({
      attributes: ["_idservicio"],
      where: {
        servicioid: servicioid,
      },
      transaction,
    });

    return servicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicio = async (transaction, servicio) => {
  try {
    const servicio_nuevo = await modelsFT.Servicio.create(servicio, { transaction });

    return servicio_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicio = async (transaction, servicio) => {
  try {
    const result = await modelsFT.Servicio.update(servicio, {
      where: {
        servicioid: servicio.servicioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicio = async (transaction, servicio) => {
  try {
    const result = await modelsFT.Servicio.update(servicio, {
      where: {
        servicioid: servicio.servicioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
