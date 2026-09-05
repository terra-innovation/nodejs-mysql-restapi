import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, cedente_limite } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getCedentelimites = async (tx: TxClient, estados: number[]) => {
  try {
    const cedentelimites = await tx.cedente_limite.findMany({
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

    return cedentelimites;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCedentelimiteById = async (tx: TxClient, idcedentelimite: number) => {
  try {
    const cedentelimite = await tx.cedente_limite.findUnique({
      include: {
        empresa: true,
        moneda: true,
      },
      where: {
        idcedentelimite: idcedentelimite,
      },
    });

    return cedentelimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCedentelimiteByCedentelimiteid = async (tx: TxClient, cedentelimiteid: string) => {
  try {
    const cedentelimite = await tx.cedente_limite.findFirst({
      include: {
        empresa: true,
        moneda: true,
      },
      where: {
        cedentelimiteid: cedentelimiteid,
      },
    });

    return cedentelimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCedentelimiteByIdcedenteAndIdmoneda = async (tx: TxClient, idcedente: number, idmoneda: number, estados: number[]) => {
  try {
    const cedentelimite = await tx.cedente_limite.findFirst({
      where: {
        idcedente: idcedente,
        idmoneda: idmoneda,
        estado: {
          in: estados,
        },
      },
    });

    return cedentelimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCedentelimitePk = async (tx: TxClient, cedentelimiteid: string) => {
  try {
    const cedentelimite = await tx.cedente_limite.findFirst({
      select: { idcedentelimite: true },
      where: {
        cedentelimiteid: cedentelimiteid,
      },
    });

    return cedentelimite;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCedentelimite = async (tx: TxClient, cedentelimite: Prisma.cedente_limiteCreateInput) => {
  try {
    const nuevo = await tx.cedente_limite.create({ data: cedentelimite });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCedentelimite = async (tx: TxClient, cedentelimiteid: string, cedentelimite: Prisma.cedente_limiteUpdateInput) => {
  try {
    const result = await tx.cedente_limite.update({
      data: cedentelimite,
      where: {
        cedentelimiteid: cedentelimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCedentelimite = async (tx: TxClient, cedentelimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.cedente_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        cedentelimiteid: cedentelimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCedentelimite = async (tx: TxClient, cedentelimiteid: string, idusuariomod: number) => {
  try {
    const result = await tx.cedente_limite.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        cedentelimiteid: cedentelimiteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
