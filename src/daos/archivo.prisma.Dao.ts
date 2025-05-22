import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ArchivoCreationAttributes } from "../models/ft_factoring/Archivo";

export const getArchivos = async (tx: TxClient, estados: number[]): Promise<archivo[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (tx: TxClient, idarchivo: number): Promise<archivo> => {
  try {
    const archivo = await tx.archivo.findUnique({ where: { idarchivo: idarchivo } });
    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByArchivoid = async (tx: TxClient, archivoid: string): Promise<archivo> => {
  try {
    const archivo = await tx.archivo.findFirst({
      where: {
        archivoid: archivoid,
      },
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPk = async (tx: TxClient, archivoid: string): Promise<{ idarchivo: number }> => {
  try {
    const archivo = await tx.archivo.findFirst({
      select: { idarchivo: true },
      where: {
        archivoid: archivoid,
      },
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (tx: TxClient, archivo: Prisma.archivoCreateInput): Promise<archivo> => {
  try {
    const nuevo = await tx.archivo.create({ data: archivo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivo = async (tx: TxClient, archivo: Partial<archivo>): Promise<archivo> => {
  try {
    const result = await tx.archivo.update({
      data: archivo,
      where: {
        archivoid: archivo.archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivo = async (tx: TxClient, archivo: Partial<archivo>): Promise<archivo> => {
  try {
    const result = await tx.archivo.update({
      data: archivo,
      where: {
        archivoid: archivo.archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivo = async (tx: TxClient, archivo: Partial<archivo>): Promise<archivo> => {
  try {
    const result = await tx.archivo.update({
      data: archivo,
      where: {
        archivoid: archivo.archivoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
