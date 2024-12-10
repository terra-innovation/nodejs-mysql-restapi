import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioverificacions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioverificacions = await models.UsuarioServicioVerificacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicioverificacions);
    return usuarioservicioverificacions;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByIdbanco = async (req, idbanco) => {
  try {
    const { models } = req.app.locals;

    const banco = await models.UsuarioServicioVerificacion.findByPk(idbanco, {});
    logger.info(line(), banco);

    //const usuarioservicioverificacions = await banco.getUsuarioservicioverificacions();
    //logger.info(line(),usuarioservicioverificacions);

    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByUsuarioservicioverificacionid = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.UsuarioServicioVerificacion.findOne({
      where: {
        bancoid: bancoid,
      },
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioverificacionPk = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.UsuarioServicioVerificacion.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioverificacion = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const banco_nuevo = await models.UsuarioServicioVerificacion.create(banco);
    // logger.info(line(),banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioverificacion = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioVerificacion.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioverificacion = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioVerificacion.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
