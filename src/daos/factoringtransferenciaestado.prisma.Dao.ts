import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_transferencia_estado } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringtransferenciaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringtransferenciaestados = await tx.factoring_transferencia_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringtransferenciaestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciaestadoByIdfactoringtransferenciaestado = async (tx: TxClient, idfactoringtransferenciaestado: number) => {
  try {
    const factoringtransferenciaestado = await tx.factoring_transferencia_estado.findUnique({
      where: {
        idfactoringtransferenciaestado: idfactoringtransferenciaestado,
      },
    });

    return factoringtransferenciaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciaestadoByFactoringtransferenciaestadoid = async (tx: TxClient, factoringtransferenciaestadoid: string) => {
  try {
    const factoringtransferenciaestado = await tx.factoring_transferencia_estado.findFirst({
      where: {
        factoringtransferenciaestadoid: factoringtransferenciaestadoid,
      },
    });

    return factoringtransferenciaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtransferenciaestadoPk = async (tx: TxClient, factoringtransferenciaestadoid: string) => {
  try {
    const factoringtransferenciaestado = await tx.factoring_transferencia_estado.findFirst({
      select: { idfactoringtransferenciaestado: true },
      where: {
        factoringtransferenciaestadoid: factoringtransferenciaestadoid,
      },
    });

    return factoringtransferenciaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtransferenciaestado = async (tx: TxClient, factoringtransferenciaestado: Prisma.factoring_transferencia_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_transferencia_estado.create({ data: factoringtransferenciaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtransferenciaestado = async (tx: TxClient, factoringtransferenciaestadoid: string, factoringtransferenciaestado: Prisma.factoring_transferencia_estadoUpdateInput) => {
  try {
    const result = await tx.factoring_transferencia_estado.update({
      data: factoringtransferenciaestado,
      where: {
        factoringtransferenciaestadoid: factoringtransferenciaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtransferenciaestado = async (tx: TxClient, factoringtransferenciaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_transferencia_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringtransferenciaestadoid: factoringtransferenciaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
