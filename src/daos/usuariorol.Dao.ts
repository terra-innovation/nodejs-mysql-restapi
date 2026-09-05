import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario_rol } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuariorols = async (tx: TxClient, estados: number[]) => {
  try {
    const usuario_rols = await tx.usuario_rol.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return usuario_rols;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuariorolByIdusuarioIdrol = async (tx: TxClient, idusuario: number, idrol: number) => {
  try {
    const usuario_rol = await tx.usuario_rol.findUnique({
      where: {
        idusuario_idrol: {
          idusuario: idusuario,
          idrol: idrol,
        },
      },
    });
    return usuario_rol;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuariorol = async (tx: TxClient, usuario_rol: Prisma.usuario_rolCreateInput) => {
  try {
    const nuevo = await tx.usuario_rol.create({ data: usuario_rol });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuariorol = async (tx: TxClient, idusuario: number, idrol: number, usuario_rol: Prisma.usuario_rolUpdateInput) => {
  try {
    const result = await tx.usuario_rol.update({
      data: usuario_rol,
      where: {
        idusuario_idrol: {
          idusuario: idusuario,
          idrol: idrol,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuariorol = async (tx: TxClient, idusuario: number, idrol: number, idusuariomod: number) => {
  try {
    const result = await tx.usuario_rol.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idusuario_idrol: {
          idusuario: idusuario,
          idrol: idrol,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateUsuariorol = async (tx: TxClient, idusuario: number, idrol: number, idusuariomod: number) => {
  try {
    const result = await tx.usuario_rol.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idusuario_idrol: {
          idusuario: idusuario,
          idrol: idrol,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
