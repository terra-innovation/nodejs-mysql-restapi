import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getServicioempresaestados = async (transaction, estados) => {
  try {
    const servicioempresaestados = await modelsFT.ServicioEmpresaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),servicioempresaestados);
    return servicioempresaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByIdservicioempresaestado = async (transaction, idservicioempresaestado) => {
  try {
    const servicioempresaestado = await modelsFT.ServicioEmpresaEstado.findByPk(idservicioempresaestado, { transaction });
    logger.info(line(), servicioempresaestado);

    //const servicioempresaestados = await servicioempresaestado.getServicioempresaestados();
    //logger.info(line(),servicioempresaestados);

    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByServicioempresaestadoid = async (transaction, servicioempresaestadoid) => {
  try {
    const servicioempresaestado = await modelsFT.ServicioEmpresaEstado.findOne({
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresaestado);
    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaestadoPk = async (transaction, servicioempresaestadoid) => {
  try {
    const servicioempresaestado = await modelsFT.ServicioEmpresaEstado.findOne({
      attributes: ["_idservicioempresaestado"],
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresaestado);
    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaestado = async (transaction, servicioempresaestado) => {
  try {
    const servicioempresaestado_nuevo = await modelsFT.ServicioEmpresaEstado.create(servicioempresaestado, { transaction });
    // logger.info(line(),servicioempresaestado_nuevo);
    return servicioempresaestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaestado = async (transaction, servicioempresaestado) => {
  try {
    const result = await modelsFT.ServicioEmpresaEstado.update(servicioempresaestado, {
      where: {
        servicioempresaestadoid: servicioempresaestado.servicioempresaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaestado = async (transaction, servicioempresaestado) => {
  try {
    const result = await modelsFT.ServicioEmpresaEstado.update(servicioempresaestado, {
      where: {
        servicioempresaestadoid: servicioempresaestado.servicioempresaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
