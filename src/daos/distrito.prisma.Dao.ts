import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, distrito } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getDistritos = async (tx: TxClient, estados: number[]): Promise<distrito[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByIddistrito = async (tx: TxClient, iddistrito: number): Promise<distrito> => {
  try {
    const distrito = await tx.distrito.findUnique({
      where: {
        iddistrito: iddistrito,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByDistritoid = async (tx: TxClient, distritoid: string): Promise<distrito> => {
  try {
    const distrito = await tx.distrito.findFirst({
      where: {
        distritoid: distritoid,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDistritoPk = async (tx: TxClient, distritoid: string): Promise<{ iddistrito: number }> => {
  try {
    const distrito = await tx.distrito.findFirst({
      select: { iddistrito: true },
      where: {
        distritoid: distritoid,
      },
    });

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDistrito = async (tx: TxClient, distrito: Prisma.distritoCreateInput): Promise<distrito> => {
  try {
    const nuevo = await tx.distrito.create({ data: distrito });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDistrito = async (tx: TxClient, distrito: Partial<distrito>): Promise<distrito> => {
  try {
    const result = await tx.distrito.update({
      data: distrito,
      where: {
        distritoid: distrito.distritoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDistrito = async (tx: TxClient, distrito: Partial<distrito>): Promise<distrito> => {
  try {
    const result = await tx.distrito.update({
      data: distrito,
      where: {
        distritoid: distrito.distritoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
