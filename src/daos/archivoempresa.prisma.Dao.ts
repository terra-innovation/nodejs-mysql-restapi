import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_empresa } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivoempresas = async (tx: TxClient, estados: number[]): Promise<archivo_empresa[]> => {
  try {
    const archivoempresas = await tx.archivo_empresa.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivoempresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByIdarchivoempresa = async (tx: TxClient, idarchivo: number, idempresa: number): Promise<archivo_empresa> => {
  try {
    const archivoempresa = await tx.archivo_empresa.findUnique({
      where: {
        idarchivo_idempresa: {
          idarchivo: idarchivo,
          idempresa: idempresa,
        },
      },
    });

    return archivoempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoEmpresa = async (tx: TxClient, archivoempresa: Prisma.archivo_empresaCreateInput): Promise<archivo_empresa> => {
  try {
    const nuevo = await tx.archivo_empresa.create({ data: archivoempresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoEmpresa = async (tx: TxClient, archivoempresa: Partial<archivo_empresa>): Promise<archivo_empresa> => {
  try {
    const result = await tx.archivo_empresa.update({
      data: archivoempresa,
      where: {
        idarchivo_idempresa: {
          idarchivo: archivoempresa.idarchivo,
          idempresa: archivoempresa.idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoEmpresa = async (tx: TxClient, archivoempresa: Partial<archivo_empresa>): Promise<archivo_empresa> => {
  try {
    const result = await tx.archivo_empresa.update({
      data: archivoempresa,
      where: {
        idarchivo_idempresa: {
          idarchivo: archivoempresa.idarchivo,
          idempresa: archivoempresa.idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoEmpresa = async (tx: TxClient, archivoempresa: Partial<archivo_empresa>): Promise<archivo_empresa> => {
  try {
    const result = await tx.archivo_empresa.update({
      data: archivoempresa,
      where: {
        idarchivo_idempresa: {
          idarchivo: archivoempresa.idarchivo,
          idempresa: archivoempresa.idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
