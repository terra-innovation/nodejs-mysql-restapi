import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getDetraccionestados = async (tx: TxClient, estados: number[]) => {
  try {
    const detraccionestados = await tx.detraccion_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return detraccionestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDetraccionestadoByIddetraccionestado = async (tx: TxClient, iddetraccionestado: number) => {
  try {
    const detraccionestado = await tx.detraccion_estado.findUnique({ where: { iddetraccionestado: iddetraccionestado } });

    //const detraccionestados = await detraccionestado.getDetraccionestados();

    return detraccionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDetraccionestadoByDetraccionestadoid = async (tx: TxClient, detraccionestadoid: string) => {
  try {
    const detraccionestado = await tx.detraccion_estado.findFirst({
      where: {
        detraccionestadoid: detraccionestadoid,
      },
    });

    return detraccionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDetraccionestadoPk = async (tx: TxClient, detraccionestadoid: string) => {
  try {
    const detraccionestado = await tx.detraccion_estado.findFirst({
      select: { iddetraccionestado: true },
      where: {
        detraccionestadoid: detraccionestadoid,
      },
    });

    return detraccionestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDetraccionestado = async (tx: TxClient, detraccionestado: Prisma.detraccion_estadoCreateInput) => {
  try {
    const nuevo = await tx.detraccion_estado.create({ data: detraccionestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDetraccionestado = async (tx: TxClient, detraccionestadoid: string, detraccionestado: Prisma.detraccion_estadoUpdateInput) => {
  try {
    const result = await tx.detraccion_estado.update({
      data: detraccionestado,
      where: {
        detraccionestadoid: detraccionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDetraccionestado = async (tx: TxClient, detraccionestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.detraccion_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        detraccionestadoid: detraccionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
