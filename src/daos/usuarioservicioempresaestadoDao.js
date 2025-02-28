import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioempresaestados = async (transaction, estados) => {
  try {
    const usuarioservicioempresaestados = await modelsFT.UsuarioServicioEmpresaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresaestados);
    return usuarioservicioempresaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado = async (transaction, idusuarioservicioempresaestado) => {
  try {
    const usuarioservicioempresaestado = await modelsFT.UsuarioServicioEmpresaEstado.findByPk(idusuarioservicioempresaestado, { transaction });
    logger.info(line(), usuarioservicioempresaestado);

    //const usuarioservicioempresaestados = await usuarioservicioempresaestado.getUsuarioservicioempresaestados();
    //logger.info(line(),usuarioservicioempresaestados);

    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByUsuarioservicioempresaestadoid = async (transaction, usuarioservicioempresaestadoid) => {
  try {
    const usuarioservicioempresaestado = await modelsFT.UsuarioServicioEmpresaEstado.findOne({
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresaestado);
    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaestadoPk = async (transaction, usuarioservicioempresaestadoid) => {
  try {
    const usuarioservicioempresaestado = await modelsFT.UsuarioServicioEmpresaEstado.findOne({
      attributes: ["_idusuarioservicioempresaestado"],
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresaestado);
    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresaestado = async (transaction, usuarioservicioempresaestado) => {
  try {
    const usuarioservicioempresaestado_nuevo = await modelsFT.UsuarioServicioEmpresaEstado.create(usuarioservicioempresaestado, { transaction });
    // logger.info(line(),usuarioservicioempresaestado_nuevo);
    return usuarioservicioempresaestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresaestado = async (transaction, usuarioservicioempresaestado) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresaEstado.update(usuarioservicioempresaestado, {
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestado.usuarioservicioempresaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresaestado = async (transaction, usuarioservicioempresaestado) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresaEstado.update(usuarioservicioempresaestado, {
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestado.usuarioservicioempresaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
