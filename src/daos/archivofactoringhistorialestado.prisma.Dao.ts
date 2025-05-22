import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_factoring_historial_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivofactoringhistorialestados = async (tx: TxClient, estados: number[]): Promise<archivo_factoring_historial_estado[]> => {
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

export const getArchivofactoringhistorialestadoByIdarchivofactoringhistorialestado = async (tx: TxClient, idarchivo: number, idfactoringhistorialestado: number): Promise<archivo_factoring_historial_estado> => {
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

export const insertArchivofactoringhistorialestado = async (tx: TxClient, archivofactoringhistorialestado: Prisma.archivo_factoring_historial_estadoCreateInput): Promise<archivo_factoring_historial_estado> => {
  try {
    const nuevo = await tx.archivo_factoring_historial_estado.create({ data: archivofactoringhistorialestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivofactoringhistorialestado = async (tx: TxClient, archivofactoringhistorialestado: Partial<archivo_factoring_historial_estado>): Promise<archivo_factoring_historial_estado> => {
  try {
    const result = await tx.archivo_factoring_historial_estado.update({
      data: archivofactoringhistorialestado,
      where: {
        idarchivo_idfactoringhistorialestado: {
          idarchivo: archivofactoringhistorialestado.idarchivo,
          idfactoringhistorialestado: archivofactoringhistorialestado.idfactoringhistorialestado,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivofactoringhistorialestado = async (tx: TxClient, archivofactoringhistorialestado: Partial<archivo_factoring_historial_estado>): Promise<archivo_factoring_historial_estado> => {
  try {
    const result = await tx.archivo_factoring_historial_estado.update({
      data: archivofactoringhistorialestado,
      where: {
        idarchivo_idfactoringhistorialestado: {
          idarchivo: archivofactoringhistorialestado.idarchivo,
          idfactoringhistorialestado: archivofactoringhistorialestado.idfactoringhistorialestado,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
