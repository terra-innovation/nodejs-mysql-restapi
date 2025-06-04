import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_empresa } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivoempresas = async (tx: TxClient, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByIdarchivoempresa = async (tx: TxClient, idarchivo: number, idempresa: number) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoEmpresa = async (tx: TxClient, archivoempresa: Prisma.archivo_empresaCreateInput) => {
  try {
    const nuevo = await tx.archivo_empresa.create({ data: archivoempresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoEmpresa = async (tx: TxClient, idarchivo: number, idempresa: number, archivoempresa: Prisma.archivo_empresaUpdateInput) => {
  try {
    const result = await tx.archivo_empresa.update({
      data: archivoempresa,
      where: {
        idarchivo_idempresa: {
          idarchivo: idarchivo,
          idempresa: idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoEmpresa = async (tx: TxClient, idarchivo: number, idempresa: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idempresa: {
          idarchivo: idarchivo,
          idempresa: idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoEmpresa = async (tx: TxClient, idarchivo: number, idempresa: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idarchivo_idempresa: {
          idarchivo: idarchivo,
          idempresa: idempresa,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
