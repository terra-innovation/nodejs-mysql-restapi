import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_propuesta_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringpropuestaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringpropuestaestados = await tx.factoring_propuesta_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringpropuestaestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaestadoByIdfactoringpropuestaestado = async (tx: TxClient, idfactoringpropuestaestado: number) => {
  try {
    const factoringpropuestaestado = await tx.factoring_propuesta_estado.findUnique({
      where: {
        idfactoringpropuestaestado: idfactoringpropuestaestado,
      },
    });

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaestadoByFactoringpropuestaestadoid = async (tx: TxClient, factoringpropuestaestadoid: string) => {
  try {
    const factoringpropuestaestado = await tx.factoring_propuesta_estado.findFirst({
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
    });

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestaestadoPk = async (tx: TxClient, factoringpropuestaestadoid: string) => {
  try {
    const factoringpropuestaestado = await tx.factoring_propuesta_estado.findFirst({
      select: { idfactoringpropuestaestado: true },
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
    });

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestado: Prisma.factoring_propuesta_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_propuesta_estado.create({ data: factoringpropuestaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestado: Partial<factoring_propuesta_estado>) => {
  try {
    const result = await tx.factoring_propuesta_estado.update({
      data: factoringpropuestaestado,
      where: {
        factoringpropuestaestadoid: factoringpropuestaestado.factoringpropuestaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestado: Partial<factoring_propuesta_estado>) => {
  try {
    const result = await tx.factoring_propuesta_estado.update({
      data: factoringpropuestaestado,
      where: {
        factoringpropuestaestadoid: factoringpropuestaestado.factoringpropuestaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
