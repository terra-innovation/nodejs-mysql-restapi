import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factor_limite } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactorlimites = async (tx: TxClient, estados: number[]) => {
  try {
    const factorlimites = await tx.factor_limite.findMany({
      include: {
        factor: true,
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factorlimites;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorlimiteById = async (tx: TxClient, idfactorlimite: number) => {
  try {
    const factorlimite = await tx.factor_limite.findUnique({
      include: {
        factor: true,
        moneda: true,
      },
      where: {
        idfactorlimite: idfactorlimite,
      },
    });

    return factorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorlimiteByFactorlimiteid = async (tx: TxClient, factorlimiteid: string) => {
  try {
    const factorlimite = await tx.factor_limite.findFirst({
      include: {
        factor: true,
        moneda: true,
      },
      where: {
        factorlimiteid: factorlimiteid,
      },
    });

    return factorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorlimiteByIdfactorAndIdmoneda = async (tx: TxClient, idfactor: number, idmoneda: number, estados: number[]) => {
  try {
    const factorlimite = await tx.factor_limite.findFirst({
      where: {
        idfactor: idfactor,
        idmoneda: idmoneda,
        estado: {
          in: estados,
        },
      },
    });

    return factorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactorlimitePk = async (tx: TxClient, factorlimiteid: string) => {
  try {
    const factorlimite = await tx.factor_limite.findFirst({
      select: { idfactorlimite: true },
      where: {
        factorlimiteid: factorlimiteid,
      },
    });

    return factorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactorlimite = async (tx: TxClient, factorlimite: Prisma.factor_limiteCreateInput) => {
  try {
    const nuevo = await tx.factor_limite.create({ data: factorlimite });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactorlimite = async (tx: TxClient, factorlimiteid: string, factorlimite: Prisma.factor_limiteUpdateInput) => {
  try {
    const result = await tx.factor_limite.update({
      data: factorlimite,
      where: {
        factorlimiteid: factorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactorlimite = async (tx: TxClient, factorlimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.factor_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factorlimiteid: factorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactorlimite = async (tx: TxClient, factorlimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.factor_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factorlimiteid: factorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
