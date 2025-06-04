import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, distrito } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getDistritos = async (tx: TxClient, estados: number[]) => {
  try {
    const distritos = await tx.distrito.findMany({
      include: {
        provincia: {
          include: {
            departamento: true,
          },
        },
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return distritos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByIddistrito = async (tx: TxClient, iddistrito: number) => {
  try {
    const distrito = await tx.distrito.findUnique({
      where: {
        iddistrito: iddistrito,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByDistritoid = async (tx: TxClient, distritoid: string) => {
  try {
    const distrito = await tx.distrito.findFirst({
      where: {
        distritoid: distritoid,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDistritoPk = async (tx: TxClient, distritoid: string) => {
  try {
    const distrito = await tx.distrito.findFirst({
      select: { iddistrito: true },
      where: {
        distritoid: distritoid,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDistrito = async (tx: TxClient, distrito: Prisma.distritoCreateInput) => {
  try {
    const nuevo = await tx.distrito.create({ data: distrito });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDistrito = async (tx: TxClient, distritoid: string, distrito: Prisma.distritoUpdateInput) => {
  try {
    const result = await tx.distrito.update({
      data: distrito,
      where: {
        distritoid: distritoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDistrito = async (tx: TxClient, distritoid: string, idusuariomod: number) => {
  try {
    const result = await tx.distrito.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        distritoid: distritoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
