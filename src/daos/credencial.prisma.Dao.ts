import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, credencial } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getCredencials = async (tx: TxClient, estados: number[]) => {
  try {
    const credencials = await tx.credencial.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return credencials;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdusuario = async (tx: TxClient, idusuario: number) => {
  try {
    const credencial = await tx.credencial.findFirst({
      where: {
        idusuario: idusuario,
      },
    });

    return credencial;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdcredencial = async (tx: TxClient, idcredencial: number) => {
  try {
    const credencial = await tx.credencial.findUnique({ where: { idcredencial: idcredencial } });

    //const credencials = await credencial.getCredencials();

    return credencial;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByCredencialid = async (tx: TxClient, credencialid: string) => {
  try {
    const credencial = await tx.credencial.findFirst({
      where: {
        credencialid: credencialid,
      },
    });

    return credencial;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCredencialPk = async (tx: TxClient, credencialid: string) => {
  try {
    const credencial = await tx.credencial.findFirst({
      select: { idcredencial: true },
      where: {
        credencialid: credencialid,
      },
    });
    return credencial;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCredencial = async (tx: TxClient, credencial: Prisma.credencialCreateInput) => {
  try {
    const nuevo = await tx.credencial.create({ data: credencial });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCredencial = async (tx: TxClient, credencialid: string, credencial: Prisma.credencialUpdateInput) => {
  try {
    const result = await tx.credencial.update({
      data: credencial,
      where: {
        credencialid: credencialid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCredencial = async (tx: TxClient, credencialid: string, idusuariomod: number) => {
  try {
    const result = await tx.credencial.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        credencialid: credencialid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
