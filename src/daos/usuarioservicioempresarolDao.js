import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioempresarols = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresarols = await models.UsuarioServicioEmpresaRol.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicioempresarols);
    return usuarioservicioempresarols;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByIdusuarioservicioempresarol = async (req, idusuarioservicioempresarol) => {
  try {
    const { models } = req.app.locals;

    const usuarioservicioempresarol = await models.UsuarioServicioEmpresaRol.findByPk(idusuarioservicioempresarol, {});
    logger.info(line(), usuarioservicioempresarol);

    //const usuarioservicioempresarols = await usuarioservicioempresarol.getUsuarioservicioempresarols();
    //logger.info(line(),usuarioservicioempresarols);

    return usuarioservicioempresarol;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByUsuarioservicioempresarolid = async (req, usuarioservicioempresarolid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresarol = await models.UsuarioServicioEmpresaRol.findOne({
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });
    //logger.info(line(),usuarioservicioempresarol);
    return usuarioservicioempresarol;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresarolPk = async (req, usuarioservicioempresarolid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresarol = await models.UsuarioServicioEmpresaRol.findOne({
      attributes: ["_idusuarioservicioempresarol"],
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });
    //logger.info(line(),usuarioservicioempresarol);
    return usuarioservicioempresarol;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresarol = async (req, usuarioservicioempresarol) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresarol_nuevo = await models.UsuarioServicioEmpresaRol.create(usuarioservicioempresarol);
    // logger.info(line(),usuarioservicioempresarol_nuevo);
    return usuarioservicioempresarol_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresarol = async (req, usuarioservicioempresarol) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresaRol.update(usuarioservicioempresarol, {
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresarol = async (req, usuarioservicioempresarol) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresaRol.update(usuarioservicioempresarol, {
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
