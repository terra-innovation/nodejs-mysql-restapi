import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioestados = async (transaction, estados) => {
  try {
    const usuarioservicioestados = await modelsFT.UsuarioServicioEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioestados);
    return usuarioservicioestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByIdusuarioservicioestado = async (transaction, idusuarioservicioestado) => {
  try {
    const usuarioservicioestado = await modelsFT.UsuarioServicioEstado.findByPk(idusuarioservicioestado, { transaction });
    logger.info(line(), usuarioservicioestado);

    //const usuarioservicioestados = await usuarioservicioestado.getUsuarioservicioestados();
    //logger.info(line(),usuarioservicioestados);

    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByUsuarioservicioestadoid = async (transaction, usuarioservicioestadoid) => {
  try {
    const usuarioservicioestado = await modelsFT.UsuarioServicioEstado.findOne({
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioestado);
    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioestadoPk = async (transaction, usuarioservicioestadoid) => {
  try {
    const usuarioservicioestado = await modelsFT.UsuarioServicioEstado.findOne({
      attributes: ["_idusuarioservicioestado"],
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioestado);
    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioestado = async (transaction, usuarioservicioestado) => {
  try {
    const usuarioservicioestado_nuevo = await modelsFT.UsuarioServicioEstado.create(usuarioservicioestado, { transaction });
    // logger.info(line(),usuarioservicioestado_nuevo);
    return usuarioservicioestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioestado = async (transaction, usuarioservicioestado) => {
  try {
    const result = await modelsFT.UsuarioServicioEstado.update(usuarioservicioestado, {
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioestado = async (transaction, usuarioservicioestado) => {
  try {
    const result = await modelsFT.UsuarioServicioEstado.update(usuarioservicioestado, {
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
