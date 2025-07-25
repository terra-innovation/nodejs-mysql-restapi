import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_estado } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivoestados = async (tx: TxClient, estados: number[]) => {
  try {
    const archivoestados = await tx.archivo_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivoestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoestadoByIdarchivoestado = async (tx: TxClient, idarchivoestado: number) => {
  try {
    const archivoestado = await tx.archivo_estado.findUnique({ where: { idarchivoestado: idarchivoestado } });
    return archivoestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoestadoByArchivoestadoid = async (tx: TxClient, archivoestadoid: string) => {
  try {
    const archivoestado = await tx.archivo_estado.findFirst({
      where: {
        archivoestadoid: archivoestadoid,
      },
    });

    return archivoestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoestadoPk = async (tx: TxClient, archivoestadoid: string) => {
  try {
    const archivoestado = await tx.archivo_estado.findFirst({
      select: { idarchivoestado: true },
      where: {
        archivoestadoid: archivoestadoid,
      },
    });

    return archivoestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoestado = async (tx: TxClient, archivoestado: Prisma.archivo_estadoCreateInput) => {
  try {
    const nuevo = await tx.archivo_estado.create({ data: archivoestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoestado = async (tx: TxClient, archivoestadoid: string, archivoestado: Prisma.archivo_estadoUpdateInput) => {
  try {
    const result = await tx.archivo_estado.update({
      data: archivoestado,
      where: {
        archivoestadoid: archivoestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoestado = async (tx: TxClient, archivoestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        archivoestadoid: archivoestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoestado = async (tx: TxClient, archivoestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        archivoestadoid: archivoestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
