import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getCuentatipos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const cuentatipos = await models.CuentaTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),cuentatipos);
    return cuentatipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByIdcuentatipo = async (req, idcuentatipo) => {
  try {
    const { models } = req.app.locals;

    const cuentatipo = await models.CuentaTipo.findByPk(idcuentatipo, {});
    logger.info(line(), cuentatipo);

    //const cuentatipos = await cuentatipo.getCuentatipos();
    //logger.info(line(),cuentatipos);

    return cuentatipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByCuentatipoid = async (req, cuentatipoid) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo = await models.CuentaTipo.findOne({
      where: {
        cuentatipoid: cuentatipoid,
      },
    });
    //logger.info(line(),cuentatipo);
    return cuentatipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentatipoPk = async (req, cuentatipoid) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo = await models.CuentaTipo.findOne({
      attributes: ["_idcuentatipo"],
      where: {
        cuentatipoid: cuentatipoid,
      },
    });
    //logger.info(line(),cuentatipo);
    return cuentatipo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo_nuevo = await models.CuentaTipo.create(cuentatipo);
    // logger.info(line(),cuentatipo_nuevo);
    return cuentatipo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
