import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, credencial } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getCredencials = async (tx: TxClient, estados: number[]): Promise<credencial[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdusuario = async (tx: TxClient, idusuario: bigint): Promise<credencial> => {
  try {
    const credencial = await tx.credencial.findFirst({
      where: {
        idusuario: idusuario,
      },
    });

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdcredencial = async (tx: TxClient, idcredencial: number): Promise<credencial> => {
  try {
    const credencial = await tx.credencial.findUnique({ where: { idcredencial: idcredencial } });

    //const credencials = await credencial.getCredencials();

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByCredencialid = async (tx: TxClient, credencialid: string): Promise<credencial> => {
  try {
    const credencial = await tx.credencial.findFirst({
      where: {
        credencialid: credencialid,
      },
    });

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCredencialPk = async (tx: TxClient, credencialid: string): Promise<{ idcredencial: bigint }> => {
  try {
    const credencial = await tx.credencial.findFirst({
      select: { idcredencial: true },
      where: {
        credencialid: credencialid,
      },
    });
    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCredencial = async (tx: TxClient, credencial: Prisma.credencialCreateInput): Promise<credencial> => {
  try {
    const nuevo = await tx.credencial.create({ data: credencial });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCredencial = async (tx: TxClient, credencial: Partial<credencial>): Promise<credencial> => {
  try {
    const result = await tx.credencial.update({
      data: credencial,
      where: {
        credencialid: credencial.credencialid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCredencial = async (tx: TxClient, credencial: Partial<credencial>): Promise<credencial> => {
  try {
    const result = await tx.credencial.update({
      data: credencial,
      where: {
        credencialid: credencial.credencialid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
