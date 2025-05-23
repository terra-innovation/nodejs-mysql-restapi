import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getUsuarioservicioestados = async (tx: TxClient, estados: number[]): Promise<usuario_servicio_estado[]> => {
  try {
    const usuarioservicioestados = await tx.usuario_servicio_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicioestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByIdusuarioservicioestado = async (tx: TxClient, idusuarioservicioestado: number): Promise<usuario_servicio_estado> => {
  try {
    const usuarioservicioestado = await tx.usuario_servicio_estado.findUnique({
      where: {
        idusuarioservicioestado: idusuarioservicioestado,
      },
    });

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioestadoByUsuarioservicioestadoid = async (tx: TxClient, usuarioservicioestadoid: string): Promise<usuario_servicio_estado> => {
  try {
    const usuarioservicioestado = await tx.usuario_servicio_estado.findFirst({
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
    });

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioestadoPk = async (tx: TxClient, usuarioservicioestadoid: string): Promise<{ idusuarioservicioestado: number }> => {
  try {
    const usuarioservicioestado = await tx.usuario_servicio_estado.findFirst({
      select: { idusuarioservicioestado: true },
      where: {
        usuarioservicioestadoid: usuarioservicioestadoid,
      },
    });

    return usuarioservicioestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioestado = async (tx: TxClient, usuarioservicioestado: Prisma.usuario_servicio_estadoCreateInput): Promise<usuario_servicio_estado> => {
  try {
    const nuevo = await tx.usuario_servicio_estado.create({ data: usuarioservicioestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioestado = async (tx: TxClient, usuarioservicioestado: Partial<usuario_servicio_estado>): Promise<usuario_servicio_estado> => {
  try {
    const result = await tx.usuario_servicio_estado.update({
      data: usuarioservicioestado,
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioestado = async (tx: TxClient, usuarioservicioestado: Partial<usuario_servicio_estado>): Promise<usuario_servicio_estado> => {
  try {
    const result = await tx.usuario_servicio_estado.update({
      data: usuarioservicioestado,
      where: {
        usuarioservicioestadoid: usuarioservicioestado.usuarioservicioestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
