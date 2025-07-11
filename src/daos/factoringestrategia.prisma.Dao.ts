import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_estrategia } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringestrategias = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringestrategias = await tx.factoring_estrategia.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringestrategias;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByIdfactoringestrategia = async (tx: TxClient, idfactoringestrategia: number) => {
  try {
    const factoringestrategia = await tx.factoring_estrategia.findUnique({ where: { idfactoringestrategia: idfactoringestrategia } });

    //const factoringestrategias = await factoringestrategia.getFactoringestrategias();

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByFactoringestrategiaid = async (tx: TxClient, factoringestrategiaid: string) => {
  try {
    const factoringestrategia = await tx.factoring_estrategia.findFirst({
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
    });

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestrategiaPk = async (tx: TxClient, factoringestrategiaid: string) => {
  try {
    const factoringestrategia = await tx.factoring_estrategia.findFirst({
      select: { idfactoringestrategia: true },
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
    });

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestrategia = async (tx: TxClient, factoringestrategia: Prisma.factoring_estrategiaCreateInput) => {
  try {
    const nuevo = await tx.factoring_estrategia.create({ data: factoringestrategia });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestrategia = async (tx: TxClient, factoringestrategiaid: string, factoringestrategia: Prisma.factoring_estrategiaUpdateInput) => {
  try {
    const result = await tx.factoring_estrategia.update({
      data: factoringestrategia,
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestrategia = async (tx: TxClient, factoringestrategiaid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_estrategia.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
