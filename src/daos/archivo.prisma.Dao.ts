import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivos = async (tx: TxClient, estados: number[]) => {
  try {
    const archivos = await tx.archivo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (tx: TxClient, idarchivo: number) => {
  try {
    const archivo = await tx.archivo.findUnique({ where: { idarchivo: idarchivo } });
    return archivo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByArchivoid = async (tx: TxClient, archivoid: string) => {
  try {
    const archivo = await tx.archivo.findFirst({
      where: {
        archivoid: archivoid,
      },
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPk = async (tx: TxClient, archivoid: string) => {
  try {
    const archivo = await tx.archivo.findFirst({
      select: { idarchivo: true },
      where: {
        archivoid: archivoid,
      },
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (tx: TxClient, archivo: Prisma.archivoCreateInput) => {
  try {
    const nuevo = await tx.archivo.create({ data: archivo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivo = async (tx: TxClient, archivoid: string, archivo: Prisma.archivoUpdateInput) => {
  try {
    const result = await tx.archivo.update({
      data: archivo,
      where: {
        archivoid: archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivo = async (tx: TxClient, archivoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        archivoid: archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivo = async (tx: TxClient, archivoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        archivoid: archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
