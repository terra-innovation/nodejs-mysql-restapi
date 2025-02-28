import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

import { v4 as uuidv4 } from "uuid";

export const getUsuarioserviciosByIdusuario = async (transaction, idusuario, estados) => {
  try {
    const usuarioservicios = await modelsFT.UsuarioServicio.findAll({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: modelsFT.UsuarioServicioEstado,
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
      transaction,
    });
    //logger.info(line(),usuarioservicios);
    return usuarioservicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const habilitarServiciosParaUsuario = async (transaction, idusuario, idusuario_session) => {
  try {
    // 1. Buscar todos los servicios que el usuario NO tiene asignados
    const serviciosFaltantes = await modelsFT.Servicio.findAll({
      where: {
        _idservicio: {
          [Sequelize.Op.notIn]: Sequelize.literal(`
            (SELECT _idservicio
            FROM usuario_servicio
            WHERE _idusuario = ${idusuario})
          `),
        },
      },
      transaction,
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
      idusuariocrea: idusuario_session,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: idusuario_session,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    }));

    await modelsFT.UsuarioServicio.bulkCreate(serviciosAInsertar, { transaction });
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicios = async (transaction, estados) => {
  try {
    const usuarioservicios = await modelsFT.UsuarioServicio.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),usuarioservicios);
    return usuarioservicios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioIdservicio = async (transaction, _idusuario, _idservicio) => {
  try {
    const usuarioservicio = await modelsFT.UsuarioServicio.findOne({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: modelsFT.UsuarioServicioEstado,
          required: true,
          as: "usuarioservicioestado_usuario_servicio_estado",
        },
      ],
      where: {
        _idusuario: _idusuario,
        _idservicio: _idservicio,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioservicio = async (transaction, idusuarioservicio) => {
  try {
    const usuarioservicio = await modelsFT.UsuarioServicio.findByPk(idusuarioservicio, { transaction });
    logger.info(line(), usuarioservicio);

    //const usuarioservicios = await usuarioservicio.getUsuarioservicios();
    //logger.info(line(),usuarioservicios);

    return usuarioservicio;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByUsuarioservicioid = async (transaction, usuarioservicioid) => {
  try {
    const usuarioservicio = await modelsFT.UsuarioServicio.findOne({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: modelsFT.UsuarioServicioEstado,
          required: true,
          as: "usuarioservicioestado_usuario_servicio_estado",
        },
      ],
      where: {
        usuarioservicioid: usuarioservicioid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioPk = async (transaction, usuarioservicioid) => {
  try {
    const usuarioservicio = await modelsFT.UsuarioServicio.findOne({
      attributes: ["_idusuarioservicio"],
      where: {
        usuarioservicioid: usuarioservicioid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicio);
    return usuarioservicio;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicio = async (transaction, usuarioservicio) => {
  try {
    const usuarioservicio_nuevo = await modelsFT.UsuarioServicio.create(usuarioservicio, { transaction });
    // logger.info(line(),usuarioservicio_nuevo);
    return usuarioservicio_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicio = async (transaction, usuarioservicio) => {
  try {
    const result = await modelsFT.UsuarioServicio.update(usuarioservicio, {
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicio = async (transaction, usuarioservicio) => {
  try {
    const result = await modelsFT.UsuarioServicio.update(usuarioservicio, {
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
