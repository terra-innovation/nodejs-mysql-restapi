import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_propuesta_estado } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestado: Prisma.factoring_propuesta_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_propuesta_estado.create({ data: factoringpropuestaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestadoid: string, factoringpropuestaestado: Prisma.factoring_propuesta_estadoUpdateInput) => {
  try {
    const result = await tx.factoring_propuesta_estado.update({
      data: factoringpropuestaestado,
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestaestado = async (tx: TxClient, factoringpropuestaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_propuesta_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
