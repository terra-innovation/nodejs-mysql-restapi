import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_propuesta_financiero } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringpropuestafinancieros = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringpropuestafinancieros = await tx.factoring_propuesta_financiero.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringpropuestafinancieros;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestafinancieroByIdfactoringpropuestafinanciero = async (tx: TxClient, idfactoringpropuestafinanciero: number) => {
  try {
    const factoringpropuestafinanciero = await tx.factoring_propuesta_financiero.findUnique({
      where: {
        idfactoringpropuestafinanciero: idfactoringpropuestafinanciero,
      },
    });

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestafinancieroByFactoringpropuestafinancieroid = async (tx: TxClient, factoringpropuestafinancieroid: string) => {
  try {
    const factoringpropuestafinanciero = await tx.factoring_propuesta_financiero.findFirst({
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinancieroid,
      },
    });

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestafinancieroPk = async (tx: TxClient, factoringpropuestafinancieroid: string) => {
  try {
    const factoringpropuestafinanciero = await tx.factoring_propuesta_financiero.findFirst({
      select: { idfactoringpropuestafinanciero: true },
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinancieroid,
      },
    });

    return factoringpropuestafinanciero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestafinanciero = async (tx: TxClient, factoringpropuestafinanciero: Prisma.factoring_propuesta_financieroCreateInput) => {
  try {
    const nuevo = await tx.factoring_propuesta_financiero.create({ data: factoringpropuestafinanciero });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestafinanciero = async (tx: TxClient, factoringpropuestafinanciero: Partial<factoring_propuesta_financiero>) => {
  try {
    const result = await tx.factoring_propuesta_financiero.update({
      data: factoringpropuestafinanciero,
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinanciero.factoringpropuestafinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestafinanciero = async (tx: TxClient, factoringpropuestafinanciero: Partial<factoring_propuesta_financiero>) => {
  try {
    const result = await tx.factoring_propuesta_financiero.update({
      data: factoringpropuestafinanciero,
      where: {
        factoringpropuestafinancieroid: factoringpropuestafinanciero.factoringpropuestafinancieroid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
