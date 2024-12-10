import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioestados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioestados = await models.UsuarioServicioEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicioestados);
    return usuarioservicioestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByIdusuarioservicioestado = async (req, idusuarioservicioestado) => {
  try {
    const { models } = req.app.locals;

    const usuarioservicioestado = await models.UsuarioServicioEstado.findByPk(idusuarioservicioestado, {});
    logger.info(line(), usuarioservicioestado);

    //const usuarioservicioestados = await usuarioservicioestado.getUsuarioservicioestados();
    //logger.info(line(),usuarioservicioestados);

    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByUsuarioservicioestadoid = async (req, usuarioservicioestadoid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioestado = await models.UsuarioServicioEstado.findOne({
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
    });
    //logger.info(line(),usuarioservicioestado);
    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioestadoPk = async (req, usuarioservicioestadoid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioestado = await models.UsuarioServicioEstado.findOne({
      attributes: ["_idusuarioservicioestado"],
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
    });
    //logger.info(line(),usuarioservicioestado);
    return usuarioservicioestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioestado = async (req, usuarioservicioestado) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioestado_nuevo = await models.UsuarioServicioEstado.create(usuarioservicioestado);
    // logger.info(line(),usuarioservicioestado_nuevo);
    return usuarioservicioestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioestado = async (req, usuarioservicioestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEstado.update(usuarioservicioestado, {
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioestado = async (req, usuarioservicioestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEstado.update(usuarioservicioestado, {
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
