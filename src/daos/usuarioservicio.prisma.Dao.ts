import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio, servicio } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import { now } from "sequelize/lib/utils";

export const getUsuarioserviciosByIdusuario = async (tx: TxClient, idusuario, estados: number[]): Promise<usuario_servicio[]> => {
  try {
    const usuarioservicios = await tx.usuario_servicio.findMany({
      include: {
        usuario: true,
        servicio: true,
        usuario_servicio_estado: true,
      },
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

export const habilitarServiciosParaUsuario = async (tx: TxClient, idusuario: bigint, idusuario_session: bigint): Promise<void> => {
  try {
    // Buscar todos los servicios
    const todosLosServicios = await tx.servicio.findMany({
      select: { idservicio: true },
    });

    const serviciosAInsertar = todosLosServicios.map((servicio) => ({
      usuarioservicioid: uuidv4(),
      idusuario,
      idservicio: servicio.idservicio,
      code: uuidv4().split("-")[0],
      idusuarioservicioestado: 1,
      idusuariocrea: Number(idusuario_session),
      fechacrea: new Date(),
      idusuariomod: Number(idusuario_session),
      fechamod: new Date(),
      estado: 1,
    }));

    await tx.usuario_servicio.createMany({
      data: serviciosAInsertar,
      skipDuplicates: true, // Prisma ignora los duplicados
    });
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicios = async (tx: TxClient, estados: number[]): Promise<usuario_servicio[]> => {
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

export const getUsuarioservicioByIdusuarioIdservicio = async (tx: TxClient, idusuario: bigint, idservicio: number): Promise<usuario_servicio> => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findFirst({
      include: {
        usuario: true,
        servicio: true,
        usuario_servicio_estado: true,
      },
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

export const getUsuarioservicioByIdusuarioservicio = async (tx: TxClient, idusuarioservicio: number): Promise<usuario_servicio> => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findUnique({
      where: { idusuarioservicio: idusuarioservicio },
    });

    return usuarioservicio;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioByUsuarioservicioid = async (tx: TxClient, usuarioservicioid: string): Promise<usuario_servicio> => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findUnique({
      include: {
        usuario: true,
        servicio: true,
        usuario_servicio_estado: true,
      },
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

export const findUsuarioservicioPk = async (tx: TxClient, usuarioservicioid: string): Promise<{ idusuarioservicio: number }> => {
  try {
    const usuarioservicio = await tx.usuario_servicio.findUnique({
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

export const insertUsuarioservicio = async (tx: TxClient, usuarioservicio: Prisma.usuario_servicioCreateInput): Promise<usuario_servicio> => {
  try {
    const nuevo = await tx.usuario_servicio.create({ data: usuarioservicio });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicio = async (tx: TxClient, usuarioservicio: Partial<usuario_servicio>): Promise<usuario_servicio> => {
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

export const deleteUsuarioservicio = async (tx: TxClient, usuarioservicio: Partial<usuario_servicio>): Promise<usuario_servicio> => {
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
