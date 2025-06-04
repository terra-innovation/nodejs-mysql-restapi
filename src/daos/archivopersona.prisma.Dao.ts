import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_persona } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivopersonas = async (tx: TxClient, estados: number[]) => {
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

export const getArchivoPersonaByIdarchivopersona = async (tx: TxClient, idarchivo: number, idpersona: number) => {
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

export const insertArchivoPersona = async (tx: TxClient, archivopersona: Prisma.archivo_personaCreateInput) => {
  try {
    const nuevo = await tx.archivo_persona.create({ data: archivopersona });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (tx: TxClient, idarchivo: number, idpersona: number, archivopersona: Prisma.archivo_personaUpdateInput) => {
  try {
    const result = await tx.archivo_persona.update({
      data: archivopersona,
      where: {
        idarchivo_idpersona: {
          idarchivo: idarchivo,
          idpersona: idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoPersona = async (tx: TxClient, idarchivo: number, idpersona: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_persona.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idpersona: {
          idarchivo: idarchivo,
          idpersona: idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoPersona = async (tx: TxClient, idarchivo: number, idpersona: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_persona.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idarchivo_idpersona: {
          idarchivo: idarchivo,
          idpersona: idpersona,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
