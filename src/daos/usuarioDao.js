import { Sequelize } from "sequelize";
import Rol from "../models/ft_factoring/Rol.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioDatosContactoByIdusuario = async (req, idusuario, estado) => {
  try {
    const { models } = req.app.locals;

    const usuario = await models.Usuario.findByPk(idusuario, {
      attributes: ["usuarioid", "usuarionombres", "apellidopaterno", "apellidomaterno", "email", "celular"],
      where: {
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    logger.info(line(), usuario);

    //const usuarios = await usuario.getUsuarios();
    //logger.info(line(),usuarios);

    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuariosActivos = async (req) => {
  try {
    const { models } = req.app.locals;
    const usuarioes = await models.Usuario.findAll({
      where: {
        estado: 1,
      },
    });
    //logger.info(line(),usuarioes);
    return usuarioes;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByIdusuario = async (req, idusuario) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findByPk(idusuario, {
      include: [
        {
          model: models.Persona,
          required: false,
          as: "persona",
        },
      ],
    });
    //logger.info(line(),usuarios);

    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const autenticarUsuario = async (req, email) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      attributes: ["_idusuario", "usuarioid", "email", "password"],
      where: {
        email: email,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioAndRolesByEmail = async (req, email) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      include: [
        {
          model: Rol,
          as: "rol_rols",
        },
      ],
      where: {
        email: email,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByUsuarioid = async (req, usuarioid) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      where: {
        usuarioid: usuarioid,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByEmail = async (req, email) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findOne({
      where: {
        email: email,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByHash = async (req, hash) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findOne({
      where: {
        hash: hash,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error.message, error.stack);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByNumerodocumento = async (req, documentonumero) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findOne({
      where: {
        documentonumero: documentonumero,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioPk = async (req, usuarioid) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      attributes: ["_idusuario"],
      where: {
        usuarioid: usuarioid,
      },
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuario = async (req, usuario) => {
  try {
    const { models } = req.app.locals;
    const usuario_nuevo = await models.Usuario.create(usuario);
    // logger.info(line(),usuario_nuevo);
    return usuario_nuevo;
  } catch (error) {
    logger.error(line(), error.original, error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuario = async (req, usuario) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Usuario.update(usuario, {
      where: {
        usuarioid: usuario.usuarioid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuario = async (req, usuario) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Usuario.update(usuario, {
      where: {
        usuarioid: usuario.usuarioid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
