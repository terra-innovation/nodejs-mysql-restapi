import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringliquidacionfinancieros = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringliquidacionfinancieros = await tx.factoring_liquidacion_financiero.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacionfinancieros;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionfinancieroByIdfactoringliquidacionfinanciero = async (tx: TxClient, idfactoringliquidacionfinanciero: number) => {
  try {
    const factoringliquidacionfinanciero = await tx.factoring_liquidacion_financiero.findUnique({
      where: {
        idfactoringliquidacionfinanciero: idfactoringliquidacionfinanciero,
      },
    });

    return factoringliquidacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionfinancieroByFactoringliquidacionfinancieroid = async (tx: TxClient, factoringliquidacionfinancieroid: string) => {
  try {
    const factoringliquidacionfinanciero = await tx.factoring_liquidacion_financiero.findFirst({
      where: {
        factoringliquidacionfinancieroid: factoringliquidacionfinancieroid,
      },
    });

    return factoringliquidacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringliquidacionfinancieroPk = async (tx: TxClient, factoringliquidacionfinancieroid: string) => {
  try {
    const factoringliquidacionfinanciero = await tx.factoring_liquidacion_financiero.findFirst({
      select: { idfactoringliquidacionfinanciero: true },
      where: {
        factoringliquidacionfinancieroid: factoringliquidacionfinancieroid,
      },
    });

    return factoringliquidacionfinanciero;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringliquidacionfinanciero = async (tx: TxClient, factoringliquidacionfinanciero: Prisma.factoring_liquidacion_financieroCreateInput) => {
  try {
    const nuevo = await tx.factoring_liquidacion_financiero.create({ data: factoringliquidacionfinanciero });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringliquidacionfinanciero = async (tx: TxClient, factoringliquidacionfinancieroid: string, factoringliquidacionfinanciero: Prisma.factoring_liquidacion_financieroUpdateInput) => {
  try {
    const result = await tx.factoring_liquidacion_financiero.update({
      data: factoringliquidacionfinanciero,
      where: {
        factoringliquidacionfinancieroid: factoringliquidacionfinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringliquidacionfinanciero = async (tx: TxClient, factoringliquidacionfinancieroid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_liquidacion_financiero.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringliquidacionfinancieroid: factoringliquidacionfinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
