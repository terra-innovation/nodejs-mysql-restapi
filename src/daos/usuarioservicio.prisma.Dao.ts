import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicios;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const habilitarServiciosParaUsuario = async (transaction, idusuario, idusuario_session) => {
  try {
    // 1. Buscar todos los servicios que el usuario NO tiene asignados
    const serviciosFaltantes = await modelsFT.Servicio.findAll({
      where: {
        _idservicio: {
          [Op.notIn]: Sequelize.literal(`
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
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicios = async (transaction, estados) => {
  try {
    const usuarioservicios = await modelsFT.UsuarioServicio.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicios;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
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

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioservicio = async (transaction, idusuarioservicio) => {
  try {
    const usuarioservicio = await modelsFT.UsuarioServicio.findByPk(idusuarioservicio, { transaction });

    //const usuarioservicios = await usuarioservicio.getUsuarioservicios();

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicio = async (transaction, usuarioservicio) => {
  try {
    const usuarioservicio_nuevo = await modelsFT.UsuarioServicio.create(usuarioservicio, { transaction });

    return usuarioservicio_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
