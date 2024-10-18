import { Sequelize } from "sequelize";
import Rol from "../models/ft_factoring/Rol.js";
import { ClientError } from "../utils/CustomErrors.js";

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
    console.log(usuario);

    //const usuarios = await usuario.getUsuarios();
    //console.log(usuarios);

    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuarioes);
    return usuarioes;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByIdusuario = async (req, idusuario) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findByPk(idusuario, {});
    console.log(usuario);

    //const usuarios = await usuario.getUsuarios();
    //console.log(usuarios);

    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByNumerodocumento = async (req, documentonumero) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      where: {
        documentonumero: documentonumero,
      },
    });
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
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
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuario = async (req, usuario) => {
  try {
    const { models } = req.app.locals;
    const usuario_nuevo = await models.Usuario.create(usuario);
    // console.log(usuario_nuevo);
    return usuario_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
