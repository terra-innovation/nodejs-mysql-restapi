import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";
import { Sequelize, Op } from "sequelize";

export const getUsuarioservicioverificacions = async (transaction, estados) => {
  try {
    const usuarioservicioverificacions = await modelsFT.UsuarioServicioVerificacion.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicioverificacions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByIdusuarioservicioverificacion = async (transaction, idusuarioservicioverificacion) => {
  try {
    const usuarioservicioverificacion = await modelsFT.UsuarioServicioVerificacion.findByPk(idusuarioservicioverificacion, { transaction });

    //const usuarioservicioverificacions = await usuarioservicioverificacion.getUsuarioservicioverificacions();

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByUsuarioservicioverificacionid = async (transaction, usuarioservicioverificacionid) => {
  try {
    const usuarioservicioverificacion = await modelsFT.UsuarioServicioVerificacion.findOne({
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
      transaction,
    });

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioverificacionPk = async (transaction, usuarioservicioverificacionid) => {
  try {
    const usuarioservicioverificacion = await modelsFT.UsuarioServicioVerificacion.findOne({
      attributes: ["_idusuarioservicioverificacion"],
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
      transaction,
    });

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioverificacion = async (transaction, usuarioservicioverificacion) => {
  try {
    const usuarioservicioverificacion_nuevo = await modelsFT.UsuarioServicioVerificacion.create(usuarioservicioverificacion, { transaction });

    return usuarioservicioverificacion_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioverificacion = async (transaction, usuarioservicioverificacion) => {
  try {
    const result = await modelsFT.UsuarioServicioVerificacion.update(usuarioservicioverificacion, {
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacion.usuarioservicioverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioverificacion = async (transaction, usuarioservicioverificacion) => {
  try {
    const result = await modelsFT.UsuarioServicioVerificacion.update(usuarioservicioverificacion, {
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacion.usuarioservicioverificacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
