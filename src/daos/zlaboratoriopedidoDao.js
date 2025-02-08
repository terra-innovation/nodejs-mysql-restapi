import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getZlaboratorioPedidos = async (transaction, estados) => {
  try {
    const zlaboratoriopedidos = await modelsFT.ZlaboratorioPedido.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),zlaboratoriopedidos);
    return zlaboratoriopedidos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioPedidoByIdzlaboratoriopedido = async (transaction, idzlaboratoriopedido) => {
  try {
    const zlaboratoriopedido = await modelsFT.ZlaboratorioPedido.findByPk(idzlaboratoriopedido, { transaction });
    logger.info(line(), zlaboratoriopedido);

    //const zlaboratoriopedidos = await zlaboratoriopedido.getZlaboratorioPedidos();
    //logger.info(line(),zlaboratoriopedidos);

    return zlaboratoriopedido;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioPedidoByZlaboratorioPedidoid = async (transaction, zlaboratoriopedidoid) => {
  try {
    const zlaboratoriopedido = await modelsFT.ZlaboratorioPedido.findOne({
      where: {
        zlaboratoriopedidoid: zlaboratoriopedidoid,
      },
      transaction,
    });
    //logger.info(line(),zlaboratoriopedido);
    return zlaboratoriopedido;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findZlaboratorioPedidoPk = async (transaction, zlaboratoriopedidoid) => {
  try {
    const zlaboratoriopedido = await modelsFT.ZlaboratorioPedido.findOne({
      attributes: ["_idzlaboratoriopedido"],
      where: {
        zlaboratoriopedidoid: zlaboratoriopedidoid,
      },
      transaction,
    });
    //logger.info(line(),zlaboratoriopedido);
    return zlaboratoriopedido;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const zlaboratoriopedido_nuevo = await modelsFT.ZlaboratorioPedido.create(zlaboratoriopedido, { transaction });
    // logger.info(line(),zlaboratoriopedido_nuevo);
    return zlaboratoriopedido_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const result = await modelsFT.ZlaboratorioPedido.update(zlaboratoriopedido, {
      where: {
        zlaboratoriopedidoid: zlaboratoriopedido.zlaboratoriopedidoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const result = await modelsFT.ZlaboratorioPedido.update(zlaboratoriopedido, {
      where: {
        zlaboratoriopedidoid: zlaboratoriopedido.zlaboratoriopedidoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
