import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_propuesta } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringpropuestasByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const facturas = await tx.factoring_propuesta.findMany({
      include: {
        factoring_estrategia: true,
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
      },
    });
    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestas = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringpropuestas = await tx.factoring_propuesta.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringpropuestas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByIdfactoringpropuesta = async (tx: TxClient, idfactoringpropuesta: number) => {
  try {
    const factoringpropuesta = await tx.factoring_propuesta.findUnique({
      where: {
        idfactoringpropuesta: idfactoringpropuesta,
      },
    });

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByFactoringpropuestaid = async (tx: TxClient, factoringpropuestaid: string) => {
  try {
    const factoringpropuesta = await tx.factoring_propuesta.findUnique({
      include: {
        factoring: true,
        factoring_estrategia: true,
        factoring_factoringpropuestaaceptadas: true,
        factoring_propuesta_estado: true,
        factoring_propuesta_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
        factoring_tipo: true,
        riesgo_aceptante: true,
        riesgo_cedente: true,
        riesgo_operacion: true,
      },
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
    });

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestaPk = async (tx: TxClient, factoringpropuestaid: string) => {
  try {
    const factoringpropuesta = await tx.factoring_propuesta.findUnique({
      select: { idfactoringpropuesta: true },
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
    });

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuesta = async (tx: TxClient, factoringpropuesta: Prisma.factoring_propuestaCreateInput) => {
  try {
    const nuevo = await tx.factoring_propuesta.create({
      data: factoringpropuesta,
    });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuesta = async (tx: TxClient, factoringpropuestaid: string, factoringpropuesta: Prisma.factoring_propuestaUpdateInput) => {
  try {
    const result = await tx.factoring_propuesta.update({
      data: factoringpropuesta,
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuesta = async (tx: TxClient, factoringpropuestaid: string, factoringpropuesta: Prisma.factoring_propuestaUpdateInput) => {
  try {
    const result = await tx.factoring_propuesta.update({
      data: factoringpropuesta,
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringpropuesta = async (tx: TxClient, factoringpropuestaid: string, factoringpropuesta: Prisma.factoring_propuestaUpdateInput) => {
  try {
    const result = await tx.factoring_propuesta.update({
      data: factoringpropuesta,
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
