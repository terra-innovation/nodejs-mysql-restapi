import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import Rol from "#src/models/ft_factoring/Rol.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getUsuarioDatosContactoByIdusuario = async (transaction, idusuario, estado) => {
  try {
    const usuario = await modelsFT.Usuario.findByPk(idusuario, {
      attributes: ["usuarioid", "usuarionombres", "apellidopaterno", "apellidomaterno", "email", "celular"],
      where: {
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
      transaction,
    });
    logger.info(line(), usuario);

    //const usuarios = await usuario.getUsuarios();
    //logger.info(line(),usuarios);

    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuariosActivos = async (transaction) => {
  try {
    const usuarioes = await modelsFT.Usuario.findAll({
      where: {
        estado: 1,
      },
      transaction,
    });
    //logger.info(line(),usuarioes);
    return usuarioes;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByIdusuario = async (transaction, idusuario) => {
  try {
    const usuario = await modelsFT.Usuario.findByPk(idusuario, {
      include: [
        {
          model: modelsFT.Persona,
          required: false,
          as: "persona",
        },
      ],
      transaction,
    });
    //logger.info(line(),usuarios);

    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const autenticarUsuario = async (transaction, email) => {
  try {
    const usuario = await modelsFT.Usuario.findOne({
      attributes: ["_idusuario", "usuarioid", "email"],
      include: [
        {
          attributes: ["password"],
          model: modelsFT.Credencial,
          required: false,
          as: "credencial",
        },
      ],
      where: {
        email: email,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioAndRolesByEmail = async (transaction, email) => {
  try {
    const usuario = await modelsFT.Usuario.findAll({
      include: [
        {
          model: modelsFT.Rol,
          as: "rol_rols",
        },
      ],
      where: {
        email: email,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByUsuarioid = async (transaction, usuarioid) => {
  try {
    const usuario = await modelsFT.Usuario.findAll({
      where: {
        usuarioid: usuarioid,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByEmail = async (transaction, email) => {
  try {
    const usuario = await modelsFT.Usuario.findOne({
      where: {
        email: email,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByHash = async (transaction, hash) => {
  try {
    const usuario = await modelsFT.Usuario.findOne({
      where: {
        hash: hash,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), error.message, error.stack);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByNumerodocumento = async (transaction, documentonumero) => {
  try {
    const usuario = await modelsFT.Usuario.findOne({
      where: {
        documentonumero: documentonumero,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioPk = async (transaction, usuarioid) => {
  try {
    const usuario = await modelsFT.Usuario.findAll({
      attributes: ["_idusuario"],
      where: {
        usuarioid: usuarioid,
      },
      transaction,
    });
    //logger.info(line(),usuario);
    return usuario;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuario = async (transaction, usuario) => {
  try {
    const usuario_nuevo = await modelsFT.Usuario.create(usuario, { transaction });
    // logger.info(line(),usuario_nuevo);
    return usuario_nuevo;
  } catch (error) {
    logger.error(line(), error.original, error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuario = async (transaction, usuario) => {
  try {
    const result = await modelsFT.Usuario.update(usuario, {
      where: {
        usuarioid: usuario.usuarioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuario = async (transaction, usuario) => {
  try {
    const result = await modelsFT.Usuario.update(usuario, {
      where: {
        usuarioid: usuario.usuarioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
