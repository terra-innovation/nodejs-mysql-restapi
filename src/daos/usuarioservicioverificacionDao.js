import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getUsuarioservicioverificacions = async (transaction, estados) => {
  try {
    const usuarioservicioverificacions = await modelsFT.UsuarioServicioVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioverificacions);
    return usuarioservicioverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByIdbanco = async (transaction, idbanco) => {
  try {
    const banco = await modelsFT.UsuarioServicioVerificacion.findByPk(idbanco, { transaction });
    logger.info(line(), banco);

    //const usuarioservicioverificacions = await banco.getUsuarioservicioverificacions();
    //logger.info(line(),usuarioservicioverificacions);

    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByUsuarioservicioverificacionid = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.UsuarioServicioVerificacion.findOne({
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioverificacionPk = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.UsuarioServicioVerificacion.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioverificacion = async (transaction, banco) => {
  try {
    const banco_nuevo = await modelsFT.UsuarioServicioVerificacion.create(banco, { transaction });
    // logger.info(line(),banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioverificacion = async (transaction, banco) => {
  try {
    const result = await modelsFT.UsuarioServicioVerificacion.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioverificacion = async (transaction, banco) => {
  try {
    const result = await modelsFT.UsuarioServicioVerificacion.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
