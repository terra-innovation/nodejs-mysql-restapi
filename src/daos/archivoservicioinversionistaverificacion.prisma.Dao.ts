import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getArchivoservicioinversionistaverificacions = async (tx: TxClient, estados: number[]) => {
  try {
    const archivoservicioinversionistaverificacions = await tx.archivo_servicio_inversionista_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivoservicioinversionistaverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoservicioinversionistaverificacionByIdarchivoservicioinversionistaverificacion = async (tx: TxClient, idarchivo: number, idservicioinversionistaverificacion: number) => {
  try {
    const archivoservicioinversionistaverificacion = await tx.archivo_servicio_inversionista_verificacion.findUnique({
      where: {
        idarchivo_idservicioinversionistaverificacion: {
          idarchivo: idarchivo,
          idservicioinversionistaverificacion: idservicioinversionistaverificacion,
        },
      },
    });

    return archivoservicioinversionistaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoservicioinversionistaverificacion = async (tx: TxClient, archivoservicioinversionistaverificacion: Prisma.archivo_servicio_inversionista_verificacionCreateInput) => {
  try {
    const nuevo = await tx.archivo_servicio_inversionista_verificacion.create({ data: archivoservicioinversionistaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoservicioinversionistaverificacion = async (tx: TxClient, idarchivo: number, idservicioinversionistaverificacion: number, archivoservicioinversionistaverificacion: Prisma.archivo_servicio_inversionista_verificacionUpdateInput) => {
  try {
    const result = await tx.archivo_servicio_inversionista_verificacion.update({
      data: archivoservicioinversionistaverificacion,
      where: {
        idarchivo_idservicioinversionistaverificacion: {
          idarchivo: idarchivo,
          idservicioinversionistaverificacion: idservicioinversionistaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoservicioinversionistaverificacion = async (tx: TxClient, idarchivo: number, idservicioinversionistaverificacion: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_servicio_inversionista_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idservicioinversionistaverificacion: {
          idarchivo: idarchivo,
          idservicioinversionistaverificacion: idservicioinversionistaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
