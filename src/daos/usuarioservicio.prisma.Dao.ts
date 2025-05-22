import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio, servicio } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";

export const getUsuarioserviciosByIdusuario = async (tx: TxClient, idusuario, estados: number[]) => {
  try {
    const usuarioservicios = await tx.usuario_servicio.findMany({
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
        idusuario: idusuario,
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicios;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const habilitarServiciosParaUsuario = async (tx: TxClient, idusuario, idusuario_session) => {
  try {
    // 1. Buscar todos los servicios que el usuario NO tiene asignados
    const serviciosFaltantes = await tx.servicio.findMany({
      where: {
        idservicio: {
          [Op.notIn]: Sequelize.literal(`
            (SELECT idservicio
            FROM usuario_servicio
            WHERE idusuario = ${idusuario})
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
      idusuario: idusuario,
      idservicio: servicio.idservicio,
      code: uuidv4().split("-")[0],
      idusuarioservicioestado: 1, // 1: Suscribirse
      idusuariocrea: idusuario_session,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: idusuario_session,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    }));

    await tx.UsuarioServicio.bulkCreate(serviciosAInsertar);
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicios = async (tx: TxClient, estados: number[]) => {
  try {
    const usuarioservicios = await tx.usuario_servicio.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicios;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioIdservicio = async (tx: TxClient, idusuario, idservicio) => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findFirst({
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
        idusuario: idusuario,
        idservicio: idservicio,
      },
    });

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByIdusuarioservicio = async (tx: TxClient, idusuarioservicio: number) => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findUnique({ where: { idusuarioservicio: idusuarioservicio } });

    //const usuarioservicios = await usuarioservicio.getUsuarioservicios();

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByUsuarioservicioid = async (tx: TxClient, usuarioservicioid: string) => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findFirst({
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
    });

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioPk = async (tx: TxClient, usuarioservicioid: string) => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findFirst({
      select: { idusuarioservicio: true },
      where: {
        usuarioservicioid: usuarioservicioid,
      },
    });

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicio = async (tx: TxClient, usuarioservicio) => {
  try {
    const nuevo = await tx.usuario_servicio.create({ data: usuarioservicio });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicio = async (tx: TxClient, usuarioservicio) => {
  try {
    const result = await tx.usuario_servicio.update({
      data: usuarioservicio,
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicio = async (tx: TxClient, usuarioservicio) => {
  try {
    const result = await tx.usuario_servicio.update({
      data: usuarioservicio,
      where: {
        usuarioservicioid: usuarioservicio.usuarioservicioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
