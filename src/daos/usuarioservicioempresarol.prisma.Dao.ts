import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_empresa_rol } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuarioservicioempresarols = async (tx: TxClient, estados: number[]) => {
  try {
    const usuarioservicioempresarols = await tx.usuario_servicio_empresa_rol.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicioempresarols;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByIdusuarioservicioempresarol = async (tx: TxClient, idusuarioservicioempresarol: number) => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findUnique({
      where: {
        idusuarioservicioempresarol: idusuarioservicioempresarol,
      },
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByUsuarioservicioempresarolid = async (tx: TxClient, usuarioservicioempresarolid: string) => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findFirst({
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresarolPk = async (tx: TxClient, usuarioservicioempresarolid: string) => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findFirst({
      select: { idusuarioservicioempresarol: true },
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarol: Prisma.usuario_servicio_empresa_rolCreateInput) => {
  try {
    const nuevo = await tx.usuario_servicio_empresa_rol.create({ data: usuarioservicioempresarol });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarolid: string, usuarioservicioempresarol: Prisma.usuario_servicio_empresa_rolUpdateInput) => {
  try {
    const result = await tx.usuario_servicio_empresa_rol.update({
      data: usuarioservicioempresarol,
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarolid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario_servicio_empresa_rol.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
