import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringestados = await tx.factoring_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
      orderBy: {
        orden: "asc",
      },
    });

    return factoringestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByIdfactoringestado = async (tx: TxClient, idfactoringestado: number) => {
  try {
    const factoringestado = await tx.factoring_estado.findUnique({ where: { idfactoringestado: idfactoringestado } });

    //const factoringestados = await factoringestado.getFactoringestados();

    return factoringestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestadoByFactoringestadoid = async (tx: TxClient, factoringestadoid: string) => {
  try {
    const factoringestado = await tx.factoring_estado.findFirst({
      where: {
        factoringestadoid: factoringestadoid,
      },
    });

    return factoringestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestadoPk = async (tx: TxClient, factoringestadoid: string) => {
  try {
    const factoringestado = await tx.factoring_estado.findFirst({
      select: { idfactoringestado: true },
      where: {
        factoringestadoid: factoringestadoid,
      },
    });

    return factoringestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestado = async (tx: TxClient, factoringestado: Prisma.factoring_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_estado.create({ data: factoringestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestado = async (tx: TxClient, factoringestadoid: string, factoringestado: Prisma.factoring_estadoUpdateInput) => {
  try {
    const result = await tx.factoring_estado.update({
      data: factoringestado,
      where: {
        factoringestadoid: factoringestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestado = async (tx: TxClient, factoringestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringestadoid: factoringestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
