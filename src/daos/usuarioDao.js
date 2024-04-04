import { ClientError } from "../utils/CustomErrors.js";

export const getUsuariosActivos = async (req) => {
  try {
    const { models } = req.app.locals;
    const usuarioes = await models.Usuario.findAll({
      attributes: {
        exclude: ["idusuario", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
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
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByUsuarioid = async (req, usuarioid) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      attributes: {
        exclude: ["idusuario", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        usuarioid: usuarioid,
      },
    });
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioPk = async (req, usuarioid) => {
  try {
    const { models } = req.app.locals;
    const usuario = await models.Usuario.findAll({
      attributes: ["idusuario"],
      where: {
        usuarioid: usuarioid,
      },
      raw: true,
    });
    //console.log(usuario);
    return usuario;
  } catch (error) {
    console.error(error.code);
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
    console.error(error.code);
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
    console.error(error.code);
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
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
