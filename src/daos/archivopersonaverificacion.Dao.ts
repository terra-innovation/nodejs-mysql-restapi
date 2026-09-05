import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getArchivopersonaverificacions = async (tx: TxClient, estados: number[]) => {
  try {
    const archivopersonaverificacions = await tx.archivo_persona_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivopersonaverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaverificacionByIdarchivopersonaverificacion = async (tx: TxClient, idarchivo: number, idpersonaverificacion: number) => {
  try {
    const archivopersonaverificacion = await tx.archivo_persona_verificacion.findUnique({
      where: {
        idarchivo_idpersonaverificacion: {
          idarchivo: idarchivo,
          idpersonaverificacion: idpersonaverificacion,
        },
      },
    });

    return archivopersonaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivopersonaverificacion = async (tx: TxClient, archivopersonaverificacion: Prisma.archivo_persona_verificacionCreateInput) => {
  try {
    const nuevo = await tx.archivo_persona_verificacion.create({ data: archivopersonaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivopersonaverificacion = async (tx: TxClient, idarchivo: number, idpersonaverificacion: number, archivopersonaverificacion: Prisma.archivo_persona_verificacionUpdateInput) => {
  try {
    const result = await tx.archivo_persona_verificacion.update({
      data: archivopersonaverificacion,
      where: {
        idarchivo_idpersonaverificacion: {
          idarchivo: idarchivo,
          idpersonaverificacion: idpersonaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivopersonaverificacion = async (tx: TxClient, idarchivo: number, idpersonaverificacion: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_persona_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idpersonaverificacion: {
          idarchivo: idarchivo,
          idpersonaverificacion: idpersonaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
