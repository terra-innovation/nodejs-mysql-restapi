import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_empresa_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuarioservicioempresaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const usuarioservicioempresaestados = await tx.usuario_servicio_empresa_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuarioservicioempresaestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado = async (tx: TxClient, idusuarioservicioempresaestado: number) => {
  try {
    const usuarioservicioempresaestado = await tx.usuario_servicio_empresa_estado.findUnique({
      where: {
        idusuarioservicioempresaestado: idusuarioservicioempresaestado,
      },
    });

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaestadoByUsuarioservicioempresaestadoid = async (tx: TxClient, usuarioservicioempresaestadoid: string) => {
  try {
    const usuarioservicioempresaestado = await tx.usuario_servicio_empresa_estado.findFirst({
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaestadoPk = async (tx: TxClient, usuarioservicioempresaestadoid: string) => {
  try {
    const usuarioservicioempresaestado = await tx.usuario_servicio_empresa_estado.findFirst({
      select: { idusuarioservicioempresaestado: true },
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });

    return usuarioservicioempresaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresaestado = async (tx: TxClient, usuarioservicioempresaestado: Prisma.usuario_servicio_empresa_estadoCreateInput) => {
  try {
    const nuevo = await tx.usuario_servicio_empresa_estado.create({ data: usuarioservicioempresaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresaestado = async (tx: TxClient, usuarioservicioempresaestadoid: string, usuarioservicioempresaestado: Prisma.usuario_servicio_empresa_estadoUpdateInput) => {
  try {
    const result = await tx.usuario_servicio_empresa_estado.update({
      data: usuarioservicioempresaestado,
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresaestado = async (tx: TxClient, usuarioservicioempresaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario_servicio_empresa_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        usuarioservicioempresaestadoid: usuarioservicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
