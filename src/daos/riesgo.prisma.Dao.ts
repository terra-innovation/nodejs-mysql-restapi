import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, riesgo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getRiesgos = async (tx: TxClient, estados: number[]) => {
  try {
    const riesgos = await tx.riesgo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return riesgos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByIdriesgo = async (tx: TxClient, idriesgo: number) => {
  try {
    const riesgo = await tx.riesgo.findUnique({ where: { idriesgo: idriesgo } });

    return riesgo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByRiesgoid = async (tx: TxClient, riesgoid: string) => {
  try {
    const riesgo = await tx.riesgo.findFirst({
      where: {
        riesgoid: riesgoid,
      },
    });

    return riesgo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findRiesgoPk = async (tx: TxClient, riesgoid: string) => {
  try {
    const riesgo = await tx.riesgo.findFirst({
      select: { idriesgo: true },
      where: {
        riesgoid: riesgoid,
      },
    });

    return riesgo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertRiesgo = async (tx: TxClient, riesgo: Prisma.riesgoCreateInput) => {
  try {
    const nuevo = await tx.riesgo.create({ data: riesgo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateRiesgo = async (tx: TxClient, riesgoid: string, riesgo: Prisma.riesgoUpdateInput) => {
  try {
    const result = await tx.riesgo.update({
      data: riesgo,
      where: {
        riesgoid: riesgoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteRiesgo = async (tx: TxClient, riesgoid: string, idusuariomod: number) => {
  try {
    const result = await tx.riesgo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        riesgoid: riesgoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
