import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getServicioempresaestados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaestados = await models.ServicioEmpresaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),servicioempresaestados);
    return servicioempresaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByIdservicioempresaestado = async (req, idservicioempresaestado) => {
  try {
    const { models } = req.app.locals;

    const servicioempresaestado = await models.ServicioEmpresaEstado.findByPk(idservicioempresaestado, {});
    logger.info(line(), servicioempresaestado);

    //const servicioempresaestados = await servicioempresaestado.getServicioempresaestados();
    //logger.info(line(),servicioempresaestados);

    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByServicioempresaestadoid = async (req, servicioempresaestadoid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaestado = await models.ServicioEmpresaEstado.findOne({
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });
    //logger.info(line(),servicioempresaestado);
    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaestadoPk = async (req, servicioempresaestadoid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaestado = await models.ServicioEmpresaEstado.findOne({
      attributes: ["_idservicioempresaestado"],
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });
    //logger.info(line(),servicioempresaestado);
    return servicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaestado = async (req, servicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const servicioempresaestado_nuevo = await models.ServicioEmpresaEstado.create(servicioempresaestado);
    // logger.info(line(),servicioempresaestado_nuevo);
    return servicioempresaestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaestado = async (req, servicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresaEstado.update(servicioempresaestado, {
      where: {
        servicioempresaestadoid: servicioempresaestado.servicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaestado = async (req, servicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresaEstado.update(servicioempresaestado, {
      where: {
        servicioempresaestadoid: servicioempresaestado.servicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
