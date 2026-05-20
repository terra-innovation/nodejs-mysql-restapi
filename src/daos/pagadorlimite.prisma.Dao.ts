import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, pagador_limite } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getPagadorlimites = async (tx: TxClient, estados: number[]) => {
  try {
    const pagadorlimites = await tx.pagador_limite.findMany({
      include: {
        empresa: true,
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return pagadorlimites;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPagadorlimiteById = async (tx: TxClient, idpagadorlimite: number) => {
  try {
    const pagadorlimite = await tx.pagador_limite.findUnique({
      include: {
        empresa: true,
        moneda: true,
      },
      where: {
        idpagadorlimite: idpagadorlimite,
      },
    });

    return pagadorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPagadorlimiteByPagadorlimiteid = async (tx: TxClient, pagadorlimiteid: string) => {
  try {
    const pagadorlimite = await tx.pagador_limite.findFirst({
      include: {
        empresa: true,
        moneda: true,
      },
      where: {
        pagadorlimiteid: pagadorlimiteid,
      },
    });

    return pagadorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPagadorlimiteByIdpagadorAndIdmoneda = async (tx: TxClient, idpagador: number, idmoneda: number, estados: number[]) => {
  try {
    const pagadorlimite = await tx.pagador_limite.findFirst({
      where: {
        idpagador: idpagador,
        idmoneda: idmoneda,
        estado: {
          in: estados,
        },
      },
    });

    return pagadorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPagadorlimitePk = async (tx: TxClient, pagadorlimiteid: string) => {
  try {
    const pagadorlimite = await tx.pagador_limite.findFirst({
      select: { idpagadorlimite: true },
      where: {
        pagadorlimiteid: pagadorlimiteid,
      },
    });

    return pagadorlimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPagadorlimite = async (tx: TxClient, pagadorlimite: Prisma.pagador_limiteCreateInput) => {
  try {
    const nuevo = await tx.pagador_limite.create({ data: pagadorlimite });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePagadorlimite = async (tx: TxClient, pagadorlimiteid: string, pagadorlimite: Prisma.pagador_limiteUpdateInput) => {
  try {
    const result = await tx.pagador_limite.update({
      data: pagadorlimite,
      where: {
        pagadorlimiteid: pagadorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePagadorlimite = async (tx: TxClient, pagadorlimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.pagador_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        pagadorlimiteid: pagadorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePagadorlimite = async (tx: TxClient, pagadorlimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.pagador_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        pagadorlimiteid: pagadorlimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
