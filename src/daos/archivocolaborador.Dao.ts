import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_colaborador } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivocolaboradors = async (tx: TxClient, estados: number[]) => {
  try {
    const archivocolaboradors = await tx.archivo_colaborador.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivocolaboradors;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByIdarchivoIdcolaborador = async (tx: TxClient, idarchivo: number, idcolaborador: number) => {
  try {
    const archivocolaborador = await tx.archivo_colaborador.findFirst({ where: { idarchivo: idarchivo, idcolaborador: idcolaborador } });

    return archivocolaborador;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoColaborador = async (tx: TxClient, archivocolaborador: Prisma.archivo_colaboradorCreateInput) => {
  try {
    const nuevo = await tx.archivo_colaborador.create({ data: archivocolaborador });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoColaborador = async (tx: TxClient, idarchivo: number, idcolaborador: number, archivocolaborador: Prisma.archivo_colaboradorUpdateInput) => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: archivocolaborador,
      where: {
        idarchivo_idcolaborador: {
          idarchivo: idarchivo,
          idcolaborador: idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoColaborador = async (tx: TxClient, idarchivo: number, idcolaborador: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idcolaborador: {
          idarchivo: idarchivo,
          idcolaborador: idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoColaborador = async (tx: TxClient, idarchivo: number, idcolaborador: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idarchivo_idcolaborador: {
          idarchivo: idarchivo,
          idcolaborador: idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
