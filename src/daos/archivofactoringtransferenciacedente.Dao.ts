import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_factoring_transferencia_cedente } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivofactoringtransferenciacedentes = async (tx: TxClient, estados: number[]) => {
  try {
    const archivofactoringtransferenciacedentes = await tx.archivo_factoring_transferencia_cedente.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivofactoringtransferenciacedentes;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringtransferenciacedenteByIdarchivofactoringtransferenciacedente = async (tx: TxClient, idarchivo: number, idfactoringtransferenciacedente: number) => {
  try {
    const archivofactoringtransferenciacedente = await tx.archivo_factoring_transferencia_cedente.findUnique({
      where: {
        idarchivo_idfactoringtransferenciacedente: {
          idarchivo: idarchivo,
          idfactoringtransferenciacedente: idfactoringtransferenciacedente,
        },
      },
    });

    return archivofactoringtransferenciacedente;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivofactoringtransferenciacedente = async (tx: TxClient, archivofactoringtransferenciacedente: Prisma.archivo_factoring_transferencia_cedenteCreateInput) => {
  try {
    const nuevo = await tx.archivo_factoring_transferencia_cedente.create({ data: archivofactoringtransferenciacedente });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivofactoringtransferenciacedente = async (tx: TxClient, idarchivo: number, idfactoringtransferenciacedente: number, archivofactoringtransferenciacedente: Prisma.archivo_factoring_transferencia_cedenteUpdateInput) => {
  try {
    const result = await tx.archivo_factoring_transferencia_cedente.update({
      data: archivofactoringtransferenciacedente,
      where: {
        idarchivo_idfactoringtransferenciacedente: {
          idarchivo: idarchivo,
          idfactoringtransferenciacedente: idfactoringtransferenciacedente,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivofactoringtransferenciacedente = async (tx: TxClient, idarchivo: number, idfactoringtransferenciacedente: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_factoring_transferencia_cedente.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idfactoringtransferenciacedente: {
          idarchivo: idarchivo,
          idfactoringtransferenciacedente: idfactoringtransferenciacedente,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
