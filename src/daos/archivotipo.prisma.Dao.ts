import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_tipo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivotipos = async (tx: TxClient, estados: number[]) => {
  try {
    const archivotipos = await tx.archivo_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivotipos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByIdarchivotipo = async (tx: TxClient, idarchivotipo: number) => {
  try {
    const archivotipo = await tx.archivo_tipo.findUnique({ where: { idarchivotipo: idarchivotipo } });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByCode = async (tx: TxClient, code) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      where: {
        code: code,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByArchivotipoid = async (tx: TxClient, archivotipoid: string) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      where: {
        archivotipoid: archivotipoid,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivotipoPk = async (tx: TxClient, archivotipoid: string) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      select: { idarchivotipo: true },
      where: {
        archivotipoid: archivotipoid,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivotipo = async (tx: TxClient, archivotipo: Prisma.archivo_tipoCreateInput) => {
  try {
    const nuevo = await tx.archivo_tipo.create({ data: archivotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivotipo = async (tx: TxClient, archivotipoid: string, archivotipo: Prisma.archivo_tipoUpdateInput) => {
  try {
    const result = await tx.archivo_tipo.update({
      data: archivotipo,
      where: {
        archivotipoid: archivotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivotipo = async (tx: TxClient, archivotipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        archivotipoid: archivotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
