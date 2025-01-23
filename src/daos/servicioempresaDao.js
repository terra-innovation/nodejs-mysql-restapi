import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getServicioempresas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const servicioempresas = await models.ServicioEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),servicioempresas);
    return servicioempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (req, idservicioempresa) => {
  try {
    const { models } = req.app.locals;

    const servicioempresa = await models.ServicioEmpresa.findByPk(idservicioempresa, {});
    logger.info(line(), servicioempresa);

    //const servicioempresas = await servicioempresa.getServicioempresas();
    //logger.info(line(),servicioempresas);

    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByServicioempresaid = async (req, servicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa = await models.ServicioEmpresa.findOne({
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaPk = async (req, servicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa = await models.ServicioEmpresa.findOne({
      attributes: ["_idservicioempresa"],
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa_nuevo = await models.ServicioEmpresa.create(servicioempresa);
    // logger.info(line(),servicioempresa_nuevo);
    return servicioempresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
