import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getUsuarioservicioestados = async (transaction, estados) => {
  try {
    const usuarioservicioestados = await modelsFT.UsuarioServicioEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicioestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByIdusuarioservicioestado = async (transaction, idusuarioservicioestado) => {
  try {
    const usuarioservicioestado = await modelsFT.UsuarioServicioEstado.findByPk(idusuarioservicioestado, { transaction });

    //const usuarioservicioestados = await usuarioservicioestado.getUsuarioservicioestados();

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioestado = async (transaction, usuarioservicioestado) => {
  try {
    const usuarioservicioestado_nuevo = await modelsFT.UsuarioServicioEstado.create(usuarioservicioestado, { transaction });

    return usuarioservicioestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
