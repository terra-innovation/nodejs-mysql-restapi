import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_factoring_historial_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivofactoringhistorialestados = async (tx: TxClient, estados: number[]) => {
  try {
    const archivofactoringhistorialestados = await tx.archivo_factoring_historial_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivofactoringhistorialestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringhistorialestadoByIdarchivofactoringhistorialestado = async (tx: TxClient, idarchivo: number, idfactoringhistorialestado: number) => {
  try {
    const archivofactoringhistorialestado = await tx.archivo_factoring_historial_estado.findUnique({
      where: {
        idarchivo_idfactoringhistorialestado: {
          idarchivo: idarchivo,
          idfactoringhistorialestado: idfactoringhistorialestado,
        },
      },
    });

    return archivofactoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivofactoringhistorialestado = async (tx: TxClient, archivofactoringhistorialestado: Prisma.archivo_factoring_historial_estadoCreateInput) => {
  try {
    const nuevo = await tx.archivo_factoring_historial_estado.create({ data: archivofactoringhistorialestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivofactoringhistorialestado = async (tx: TxClient, idarchivo: number, idfactoringhistorialestado: number, archivofactoringhistorialestado: Prisma.archivo_factoring_historial_estadoUpdateInput) => {
  try {
    const result = await tx.archivo_factoring_historial_estado.update({
      data: archivofactoringhistorialestado,
      where: {
        idarchivo_idfactoringhistorialestado: {
          idarchivo: idarchivo,
          idfactoringhistorialestado: idfactoringhistorialestado,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivofactoringhistorialestado = async (tx: TxClient, idarchivo: number, idfactoringhistorialestado: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_factoring_historial_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idfactoringhistorialestado: {
          idarchivo: idarchivo,
          idfactoringhistorialestado: idfactoringhistorialestado,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
