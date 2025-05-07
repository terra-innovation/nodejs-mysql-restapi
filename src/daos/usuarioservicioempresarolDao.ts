import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getUsuarioservicioempresarols = async (transaction, estados) => {
  try {
    const usuarioservicioempresarols = await modelsFT.UsuarioServicioEmpresaRol.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicioempresarols;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByIdusuarioservicioempresarol = async (transaction, idusuarioservicioempresarol) => {
  try {
    const usuarioservicioempresarol = await modelsFT.UsuarioServicioEmpresaRol.findByPk(idusuarioservicioempresarol, { transaction });

    //const usuarioservicioempresarols = await usuarioservicioempresarol.getUsuarioservicioempresarols();

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByUsuarioservicioempresarolid = async (transaction, usuarioservicioempresarolid) => {
  try {
    const usuarioservicioempresarol = await modelsFT.UsuarioServicioEmpresaRol.findOne({
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
      transaction,
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresarolPk = async (transaction, usuarioservicioempresarolid) => {
  try {
    const usuarioservicioempresarol = await modelsFT.UsuarioServicioEmpresaRol.findOne({
      attributes: ["_idusuarioservicioempresarol"],
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
      transaction,
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresarol = async (transaction, usuarioservicioempresarol) => {
  try {
    const usuarioservicioempresarol_nuevo = await modelsFT.UsuarioServicioEmpresaRol.create(usuarioservicioempresarol, { transaction });

    return usuarioservicioempresarol_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresarol = async (transaction, usuarioservicioempresarol) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresaRol.update(usuarioservicioempresarol, {
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresarol = async (transaction, usuarioservicioempresarol) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresaRol.update(usuarioservicioempresarol, {
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
