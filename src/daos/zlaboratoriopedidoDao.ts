import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getZlaboratorioPedidos = async (transaction, estados) => {
  try {
    const zlaboratoriopedidos = await modelsFT.ZlaboratorioPedido.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return zlaboratoriopedidos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioPedidoByIdzlaboratoriopedido = async (transaction, idzlaboratoriopedido) => {
  try {
    const zlaboratoriopedido = await modelsFT.ZlaboratorioPedido.findByPk(idzlaboratoriopedido, { transaction });

    //const zlaboratoriopedidos = await zlaboratoriopedido.getZlaboratorioPedidos();

    return zlaboratoriopedido;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioPedidoByZlaboratorioPedidoid = async (transaction, _idperdido) => {
  try {
    const zlaboratoriopedido = await modelsFT.ZlaboratorioPedido.findOne({
      where: {
        _idperdido: _idperdido,
      },
      transaction,
    });

    return zlaboratoriopedido;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const zlaboratoriopedido_nuevo = await modelsFT.ZlaboratorioPedido.create(zlaboratoriopedido, { transaction });

    return zlaboratoriopedido_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const result = await modelsFT.ZlaboratorioPedido.update(zlaboratoriopedido, {
      where: {
        _idperdido: zlaboratoriopedido._idperdido,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteZlaboratorioPedido = async (transaction, zlaboratoriopedido) => {
  try {
    const result = await modelsFT.ZlaboratorioPedido.update(zlaboratoriopedido, {
      where: {
        _idperdido: zlaboratoriopedido._idperdido,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
