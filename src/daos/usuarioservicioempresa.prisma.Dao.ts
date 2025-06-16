import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_empresa } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuarioservicioempresaByIdusuarioIdServicioIdempresa = async (tx: TxClient, idusuario: number, idservicio: number, idempresa: number) => {
  try {
    const usuarioservicioempresa = await tx.usuario_servicio_empresa.findFirst({
      where: {
        idusuario: idusuario,
        idservicio: idservicio,
        idempresa: idempresa,
      },
    });

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresas = async (tx: TxClient, estados: number[]) => {
  try {
    const usuarioservicioempresas = await tx.usuario_servicio_empresa.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicioempresas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByIdusuarioservicioempresa = async (tx: TxClient, idusuarioservicioempresa: number) => {
  try {
    const usuarioservicioempresa = await tx.usuario_servicio_empresa.findUnique({
      where: {
        idusuarioservicioempresa: idusuarioservicioempresa,
      },
    });

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByUsuarioservicioempresaid = async (tx: TxClient, usuarioservicioempresaid: string) => {
  try {
    const usuarioservicioempresa = await tx.usuario_servicio_empresa.findFirst({
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaPk = async (tx: TxClient, usuarioservicioempresaid: string) => {
  try {
    const usuarioservicioempresa = await tx.usuario_servicio_empresa.findFirst({
      select: { idusuarioservicioempresa: true },
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresa = async (tx: TxClient, usuarioservicioempresa: Prisma.usuario_servicio_empresaCreateInput) => {
  try {
    const nuevo = await tx.usuario_servicio_empresa.create({ data: usuarioservicioempresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresa = async (tx: TxClient, usuarioservicioempresaid: string, usuarioservicioempresa: Prisma.usuario_servicio_empresaUpdateInput) => {
  try {
    const result = await tx.usuario_servicio_empresa.update({
      data: usuarioservicioempresa,
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresa = async (tx: TxClient, usuarioservicioempresaid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario_servicio_empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
