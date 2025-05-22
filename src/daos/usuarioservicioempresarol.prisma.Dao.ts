import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_servicio_empresa_rol } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getUsuarioservicioempresarols = async (tx: TxClient, estados: number[]): Promise<usuario_servicio_empresa_rol[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByIdusuarioservicioempresarol = async (tx: TxClient, idusuarioservicioempresarol: number): Promise<usuario_servicio_empresa_rol> => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findUnique({ where: { idusuarioservicioempresarol: idusuarioservicioempresarol } });

    //const usuarioservicioempresarols = await usuarioservicioempresarol.getUsuarioservicioempresarols();

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresarolByUsuarioservicioempresarolid = async (tx: TxClient, usuarioservicioempresarolid: string): Promise<usuario_servicio_empresa_rol> => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findFirst({
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresarolPk = async (tx: TxClient, usuarioservicioempresarolid: string): Promise<{ idusuarioservicioempresarol: number }> => {
  try {
    const usuarioservicioempresarol = await tx.usuario_servicio_empresa_rol.findFirst({
      select: { idusuarioservicioempresarol: true },
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarolid,
      },
    });

    return usuarioservicioempresarol;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarol: Prisma.usuario_servicio_empresa_rolCreateInput): Promise<usuario_servicio_empresa_rol> => {
  try {
    const nuevo = await tx.usuario_servicio_empresa_rol.create({ data: usuarioservicioempresarol });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarol: Partial<usuario_servicio_empresa_rol>): Promise<usuario_servicio_empresa_rol> => {
  try {
    const result = await tx.usuario_servicio_empresa_rol.update({
      data: usuarioservicioempresarol,
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresarol = async (tx: TxClient, usuarioservicioempresarol: Partial<usuario_servicio_empresa_rol>): Promise<usuario_servicio_empresa_rol> => {
  try {
    const result = await tx.usuario_servicio_empresa_rol.update({
      data: usuarioservicioempresarol,
      where: {
        usuarioservicioempresarolid: usuarioservicioempresarol.usuarioservicioempresarolid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
