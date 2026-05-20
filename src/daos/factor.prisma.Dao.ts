import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factor } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactors = async (tx: TxClient, estados: number[]) => {
  try {
    const factors = await tx.factor.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factors;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorByIdfactor = async (tx: TxClient, idfactor: number) => {
  try {
    const factor = await tx.factor.findUnique({ where: { idfactor: idfactor } });

    return factor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorByFactorid = async (tx: TxClient, factorid: string) => {
  try {
    const factor = await tx.factor.findFirst({
      where: {
        factorid: factorid,
      },
    });

    return factor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactorPk = async (tx: TxClient, factorid: string) => {
  try {
    const factor = await tx.factor.findFirst({
      select: { idfactor: true },
      where: {
        factorid: factorid,
      },
    });

    return factor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
