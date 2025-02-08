import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getServicios = async (transaction, estados) => {
  try {
    const servicios = await modelsFT.Servicio.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),servicios);
    return servicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByIdbanco = async (transaction, idbanco) => {
  try {
    const banco = await modelsFT.Servicio.findByPk(idbanco, { transaction });
    logger.info(line(), banco);

    //const servicios = await banco.getServicios();
    //logger.info(line(),servicios);

    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByServicioid = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.Servicio.findOne({
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioPk = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.Servicio.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicio = async (transaction, banco) => {
  try {
    const banco_nuevo = await modelsFT.Servicio.create(banco, { transaction });
    // logger.info(line(),banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicio = async (transaction, banco) => {
  try {
    const result = await modelsFT.Servicio.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicio = async (transaction, banco) => {
  try {
    const result = await modelsFT.Servicio.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
