import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_simulacion_financiero } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringsimulacionfinancieros = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringsimulacionfinancieros = await tx.factoring_simulacion_financiero.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringsimulacionfinancieros;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsimulacionfinancieroByIdfactoringsimulacionfinanciero = async (tx: TxClient, idfactoringsimulacionfinanciero: number) => {
  try {
    const factoringsimulacionfinanciero = await tx.factoring_simulacion_financiero.findUnique({
      where: {
        idfactoringsimulacionfinanciero: idfactoringsimulacionfinanciero,
      },
    });

    return factoringsimulacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsimulacionfinancieroByFactoringsimulacionfinancieroid = async (tx: TxClient, factoringsimulacionfinancieroid: string) => {
  try {
    const factoringsimulacionfinanciero = await tx.factoring_simulacion_financiero.findFirst({
      where: {
        factoringsimulacionfinancieroid: factoringsimulacionfinancieroid,
      },
    });

    return factoringsimulacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringsimulacionfinancieroPk = async (tx: TxClient, factoringsimulacionfinancieroid: string) => {
  try {
    const factoringsimulacionfinanciero = await tx.factoring_simulacion_financiero.findFirst({
      select: { idfactoringsimulacionfinanciero: true },
      where: {
        factoringsimulacionfinancieroid: factoringsimulacionfinancieroid,
      },
    });

    return factoringsimulacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringsimulacionfinanciero = async (tx: TxClient, factoringsimulacionfinanciero: Prisma.factoring_simulacion_financieroCreateInput) => {
  try {
    const nuevo = await tx.factoring_simulacion_financiero.create({ data: factoringsimulacionfinanciero });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringsimulacionfinanciero = async (tx: TxClient, factoringsimulacionfinancieroid: string, factoringsimulacionfinanciero: Prisma.factoring_simulacion_financieroUpdateInput) => {
  try {
    const result = await tx.factoring_simulacion_financiero.update({
      data: factoringsimulacionfinanciero,
      where: {
        factoringsimulacionfinancieroid: factoringsimulacionfinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringsimulacionfinanciero = async (tx: TxClient, factoringsimulacionfinancieroid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_simulacion_financiero.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringsimulacionfinancieroid: factoringsimulacionfinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
