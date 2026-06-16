import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringliquidacionestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringliquidacionestados = await tx.factoring_liquidacion_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacionestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionestadoByIdfactoringliquidacionestado = async (tx: TxClient, idfactoringliquidacionestado: number) => {
  try {
    const factoringliquidacionestado = await tx.factoring_liquidacion_estado.findUnique({
      where: {
        idfactoringliquidacionestado: idfactoringliquidacionestado,
      },
    });

    return factoringliquidacionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionestadoByFactoringliquidacionestadoid = async (tx: TxClient, factoringliquidacionestadoid: string) => {
  try {
    const factoringliquidacionestado = await tx.factoring_liquidacion_estado.findFirst({
      where: {
        factoringliquidacionestadoid: factoringliquidacionestadoid,
      },
    });

    return factoringliquidacionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringliquidacionestadoPk = async (tx: TxClient, factoringliquidacionestadoid: string) => {
  try {
    const factoringliquidacionestado = await tx.factoring_liquidacion_estado.findFirst({
      select: { idfactoringliquidacionestado: true },
      where: {
        factoringliquidacionestadoid: factoringliquidacionestadoid,
      },
    });

    return factoringliquidacionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringliquidacionestado = async (tx: TxClient, factoringliquidacionestado: Prisma.factoring_liquidacion_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_liquidacion_estado.create({ data: factoringliquidacionestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringliquidacionestado = async (tx: TxClient, factoringliquidacionestadoid: string, factoringliquidacionestado: Prisma.factoring_liquidacion_estadoUpdateInput) => {
  try {
    const result = await tx.factoring_liquidacion_estado.update({
      data: factoringliquidacionestado,
      where: {
        factoringliquidacionestadoid: factoringliquidacionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringliquidacionestado = async (tx: TxClient, factoringliquidacionestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_liquidacion_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringliquidacionestadoid: factoringliquidacionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
