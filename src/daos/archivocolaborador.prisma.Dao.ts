import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_colaborador } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivocolaboradors = async (tx: TxClient, estados: number[]): Promise<archivo_colaborador[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByIdarchivoIdcolaborador = async (tx: TxClient, idarchivo: number, idcolaborador: number): Promise<archivo_colaborador> => {
  try {
    const archivocolaborador = await tx.archivo_colaborador.findFirst({ where: { idarchivo: idarchivo, idcolaborador: idcolaborador } });

    return archivocolaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoColaborador = async (tx: TxClient, archivocolaborador: Prisma.archivo_colaboradorCreateInput): Promise<archivo_colaborador> => {
  try {
    const nuevo = await tx.archivo_colaborador.create({ data: archivocolaborador });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoColaborador = async (tx: TxClient, archivocolaborador: Partial<archivo_colaborador>): Promise<archivo_colaborador> => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: archivocolaborador,
      where: {
        idarchivo_idcolaborador: {
          idarchivo: archivocolaborador.idarchivo,
          idcolaborador: archivocolaborador.idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoColaborador = async (tx: TxClient, archivocolaborador: Partial<archivo_colaborador>): Promise<archivo_colaborador> => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: archivocolaborador,
      where: {
        idarchivo_idcolaborador: {
          idarchivo: archivocolaborador.idarchivo,
          idcolaborador: archivocolaborador.idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoColaborador = async (tx: TxClient, archivocolaborador: Partial<archivo_colaborador>): Promise<archivo_colaborador> => {
  try {
    const result = await tx.archivo_colaborador.update({
      data: archivocolaborador,
      where: {
        idarchivo_idcolaborador: {
          idarchivo: archivocolaborador.idarchivo,
          idcolaborador: archivocolaborador.idcolaborador,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
