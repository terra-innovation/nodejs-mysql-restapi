import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getColaboradortipos = async (transaction, estados) => {
  try {
    const colaboradortipos = await modelsFT.ColaboradorTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),colaboradortipos);
    return colaboradortipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByIdcolaboradortipo = async (transaction, idcolaboradortipo) => {
  try {
    const colaboradortipo = await modelsFT.ColaboradorTipo.findByPk(idcolaboradortipo, { transaction });
    logger.info(line(), colaboradortipo);

    //const colaboradortipos = await colaboradortipo.getColaboradortipos();
    //logger.info(line(),colaboradortipos);

    return colaboradortipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByColaboradortipoid = async (transaction, colaboradortipoid) => {
  try {
    const colaboradortipo = await modelsFT.ColaboradorTipo.findOne({
      where: {
        colaboradortipoid: colaboradortipoid,
      },
      transaction,
    });
    //logger.info(line(),colaboradortipo);
    return colaboradortipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradortipoPk = async (transaction, colaboradortipoid) => {
  try {
    const colaboradortipo = await modelsFT.ColaboradorTipo.findOne({
      attributes: ["_idcolaboradortipo"],
      where: {
        colaboradortipoid: colaboradortipoid,
      },
      transaction,
    });
    //logger.info(line(),colaboradortipo);
    return colaboradortipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaboradortipo = async (transaction, colaboradortipo) => {
  try {
    const colaboradortipo_nuevo = await modelsFT.ColaboradorTipo.create(colaboradortipo, { transaction });
    // logger.info(line(),colaboradortipo_nuevo);
    return colaboradortipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaboradortipo = async (transaction, colaboradortipo) => {
  try {
    const result = await modelsFT.ColaboradorTipo.update(colaboradortipo, {
      where: {
        colaboradortipoid: colaboradortipo.colaboradortipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaboradortipo = async (transaction, colaboradortipo) => {
  try {
    const result = await modelsFT.ColaboradorTipo.update(colaboradortipo, {
      where: {
        colaboradortipoid: colaboradortipo.colaboradortipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
