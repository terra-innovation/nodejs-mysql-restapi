import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getUsuarioservicioempresaestados = async (transaction, estados) => {
  try {
    const usuarioservicioempresaestados = await modelsFT.UsuarioServicioEmpresaEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicioempresaestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado = async (transaction, idusuarioservicioempresaestado) => {
  try {
    const usuarioservicioempresaestado = await modelsFT.UsuarioServicioEmpresaEstado.findByPk(idusuarioservicioempresaestado, { transaction });

    //const usuarioservicioempresaestados = await usuarioservicioempresaestado.getUsuarioservicioempresaestados();

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresaestado = async (transaction, usuarioservicioempresaestado) => {
  try {
    const usuarioservicioempresaestado_nuevo = await modelsFT.UsuarioServicioEmpresaEstado.create(usuarioservicioempresaestado, { transaction });

    return usuarioservicioempresaestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
