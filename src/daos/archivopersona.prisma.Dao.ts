import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_persona } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivopersonas = async (tx: TxClient, estados: number[]): Promise<archivo_persona[]> => {
  try {
    const archivopersonas = await tx.archivo_persona.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivopersonas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByIdarchivopersona = async (tx: TxClient, idarchivo: number, idpersona: number): Promise<archivo_persona> => {
  try {
    const archivopersona = await tx.archivo_persona.findUnique({
      where: {
        idarchivo_idpersona: {
          idarchivo: idarchivo,
          idpersona: idpersona,
        },
      },
    });

    return archivopersona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoPersona = async (tx: TxClient, archivopersona: Prisma.archivo_personaCreateInput): Promise<archivo_persona> => {
  try {
    const nuevo = await tx.archivo_persona.create({ data: archivopersona });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (tx: TxClient, archivopersona: Partial<archivo_persona>): Promise<archivo_persona> => {
  try {
    const result = await tx.archivo_persona.update({
      data: archivopersona,
      where: {
        idarchivo_idpersona: {
          idarchivo: archivopersona.idarchivo,
          idpersona: archivopersona.idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoPersona = async (tx: TxClient, archivopersona: Partial<archivo_persona>): Promise<archivo_persona> => {
  try {
    const result = await tx.archivo_persona.update({
      data: archivopersona,
      where: {
        idarchivo_idpersona: {
          idarchivo: archivopersona.idarchivo,
          idpersona: archivopersona.idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoPersona = async (tx: TxClient, archivopersona: Partial<archivo_persona>): Promise<archivo_persona> => {
  try {
    const result = await tx.archivo_persona.update({
      data: archivopersona,
      where: {
        idarchivo_idpersona: {
          idarchivo: archivopersona.idarchivo,
          idpersona: archivopersona.idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
