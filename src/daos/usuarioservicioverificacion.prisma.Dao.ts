import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_verificacion } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuarioservicioverificacions = async (tx: TxClient, estados: number[]) => {
  try {
    const usuarioservicioverificacions = await tx.usuario_servicio_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicioverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByIdusuarioservicioverificacion = async (tx: TxClient, idusuarioservicioverificacion: number) => {
  try {
    const usuarioservicioverificacion = await tx.usuario_servicio_verificacion.findUnique({
      where: {
        idusuarioservicioverificacion: idusuarioservicioverificacion,
      },
    });

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioverificacionByUsuarioservicioverificacionid = async (tx: TxClient, usuarioservicioverificacionid: string) => {
  try {
    const usuarioservicioverificacion = await tx.usuario_servicio_verificacion.findFirst({
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
    });

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioverificacionPk = async (tx: TxClient, usuarioservicioverificacionid: string) => {
  try {
    const usuarioservicioverificacion = await tx.usuario_servicio_verificacion.findFirst({
      select: { idusuarioservicioverificacion: true },
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
    });

    return usuarioservicioverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioverificacion = async (tx: TxClient, usuarioservicioverificacion: Prisma.usuario_servicio_verificacionCreateInput) => {
  try {
    const nuevo = await tx.usuario_servicio_verificacion.create({ data: usuarioservicioverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioverificacion = async (tx: TxClient, usuarioservicioverificacionid: string, usuarioservicioverificacion: Prisma.usuario_servicio_verificacionUpdateInput) => {
  try {
    const result = await tx.usuario_servicio_verificacion.update({
      data: usuarioservicioverificacion,
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioverificacion = async (tx: TxClient, usuarioservicioverificacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario_servicio_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        usuarioservicioverificacionid: usuarioservicioverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
