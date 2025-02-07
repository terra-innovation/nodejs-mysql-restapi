import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

import { v4 as uuidv4 } from "uuid";

export const getUsuarioserviciosByIdusuario = async (req, idusuario, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicios = await models.UsuarioServicio.findAll({
      include: [
        {
          model: models.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: models.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: models.UsuarioServicioEstado,
          required: true,
          as: "usuarioservicioestado_usuario_servicio_estado",
        },
      ],
      where: {
        _idusuario: idusuario,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicios);
    return usuarioservicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const habilitarServiciosParaUsuario = async (req, idusuario) => {
  try {
    const { models } = req.app.locals;
    // 1. Buscar todos los servicios que el usuario NO tiene asignados
    const serviciosFaltantes = await models.Servicio.findAll({
      where: {
        _idservicio: {
          [Sequelize.Op.notIn]: Sequelize.literal(`
            (SELECT _idservicio
            FROM usuario_servicio
            WHERE _idusuario = ${idusuario})
          `),
        },
      },
    });

    // 2. Comprobar si no hay servicios faltantes
    if (!serviciosFaltantes || serviciosFaltantes.length === 0) {
      return; // Terminar la función si no hay servicios faltantes
    }

    // 3. Insertar los registros en la tabla usuario_servicio
    const serviciosAInsertar = serviciosFaltantes.map((servicio) => ({
      usuarioservicioid: uuidv4(),
      _idusuario: idusuario,
      _idservicio: servicio._idservicio,
      code: uuidv4().split("-")[0],
      _idusuarioservicioestado: 1, // 1: Suscribirse
      idusuariocrea: req.session_user.usuario._idusuario ?? 1,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    }));

    await models.UsuarioServicio.bulkCreate(serviciosAInsertar);
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicios = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicios = await models.UsuarioServicio.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicios);
    return usuarioservicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioIdservicio = async (req, _idusuario, _idservicio) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicio = await models.UsuarioServicio.findOne({
      include: [
        {
          model: models.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: models.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: models.UsuarioServicioEstado,
          required: true,
          as: "usuarioservicioestado_usuario_servicio_estado",
        },
      ],
      where: {
        _idusuario: _idusuario,
        _idservicio: _idservicio,
      },
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioservicio = async (req, idusuarioservicio) => {
  try {
    const { models } = req.app.locals;

    const usuarioservicio = await models.UsuarioServicio.findByPk(idusuarioservicio, {});
    logger.info(line(), usuarioservicio);

    //const usuarioservicios = await usuarioservicio.getUsuarioservicios();
    //logger.info(line(),usuarioservicios);

    return usuarioservicio;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByUsuarioservicioid = async (req, usuarioservicioid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicio = await models.UsuarioServicio.findOne({
      include: [
        {
          model: models.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: models.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: models.UsuarioServicioEstado,
          required: true,
          as: "usuarioservicioestado_usuario_servicio_estado",
        },
      ],
      where: {
        usuarioservicioid: usuarioservicioid,
      },
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioPk = async (req, usuarioservicioid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicio = await models.UsuarioServicio.findOne({
      attributes: ["_idusuarioservicio"],
      where: {
        usuarioservicioid: usuarioservicioid,
      },
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicio = async (req, usuarioservicio) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicio_nuevo = await models.UsuarioServicio.create(usuarioservicio);
    // logger.info(line(),usuarioservicio_nuevo);
    return usuarioservicio_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicio = async (req, usuarioservicio) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicio.update(usuarioservicio, {
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicio = async (req, usuarioservicio) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicio.update(usuarioservicio, {
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
