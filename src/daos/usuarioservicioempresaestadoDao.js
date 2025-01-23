import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioempresaestados = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresaestados = await models.UsuarioServicioEmpresaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicioempresaestados);
    return usuarioservicioempresaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado = async (req, idusuarioservicioempresaestado) => {
  try {
    const { models } = req.app.locals;

    const usuarioservicioempresaestado = await models.UsuarioServicioEmpresaEstado.findByPk(idusuarioservicioempresaestado, {});
    logger.info(line(), usuarioservicioempresaestado);

    //const usuarioservicioempresaestados = await usuarioservicioempresaestado.getUsuarioservicioempresaestados();
    //logger.info(line(),usuarioservicioempresaestados);

    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByUsuarioservicioempresaestadoid = async (req, usuarioservicioempresaestadoid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresaestado = await models.UsuarioServicioEmpresaEstado.findOne({
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });
    //logger.info(line(),usuarioservicioempresaestado);
    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaestadoPk = async (req, usuarioservicioempresaestadoid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresaestado = await models.UsuarioServicioEmpresaEstado.findOne({
      attributes: ["_idusuarioservicioempresaestado"],
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });
    //logger.info(line(),usuarioservicioempresaestado);
    return usuarioservicioempresaestado;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresaestado = async (req, usuarioservicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresaestado_nuevo = await models.UsuarioServicioEmpresaEstado.create(usuarioservicioempresaestado);
    // logger.info(line(),usuarioservicioempresaestado_nuevo);
    return usuarioservicioempresaestado_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresaestado = async (req, usuarioservicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresaEstado.update(usuarioservicioempresaestado, {
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestado.usuarioservicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresaestado = async (req, usuarioservicioempresaestado) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresaEstado.update(usuarioservicioempresaestado, {
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestado.usuarioservicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
