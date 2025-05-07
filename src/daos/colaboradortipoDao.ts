import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getColaboradortipos = async (transaction, estados) => {
  try {
    const colaboradortipos = await modelsFT.ColaboradorTipo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return colaboradortipos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByIdcolaboradortipo = async (transaction, idcolaboradortipo) => {
  try {
    const colaboradortipo = await modelsFT.ColaboradorTipo.findByPk(idcolaboradortipo, { transaction });

    //const colaboradortipos = await colaboradortipo.getColaboradortipos();

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaboradortipo = async (transaction, colaboradortipo) => {
  try {
    const colaboradortipo_nuevo = await modelsFT.ColaboradorTipo.create(colaboradortipo, { transaction });

    return colaboradortipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
