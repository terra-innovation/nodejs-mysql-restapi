import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_inversionista_verificacion } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getServicioinversionistaverificacions = async (tx: TxClient, estados: number[]) => {
  try {
    const servicioinversionistaverificacions = await tx.servicio_inversionista_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioinversionistaverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaverificacionByIdservicioinversionistaverificacion = async (tx: TxClient, idservicioinversionistaverificacion: number) => {
  try {
    const servicioinversionistaverificacion = await tx.servicio_inversionista_verificacion.findUnique({
      where: {
        idservicioinversionistaverificacion: idservicioinversionistaverificacion,
      },
    });

    return servicioinversionistaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaverificacionByServicioinversionistaverificacionid = async (tx: TxClient, servicioinversionistaverificacionid: string) => {
  try {
    const servicioinversionistaverificacion = await tx.servicio_inversionista_verificacion.findFirst({
      where: {
        servicioinversionistaverificacionid: servicioinversionistaverificacionid,
      },
    });

    return servicioinversionistaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioinversionistaverificacionPk = async (tx: TxClient, servicioinversionistaverificacionid: string) => {
  try {
    const servicioinversionistaverificacion = await tx.servicio_inversionista_verificacion.findFirst({
      select: { idservicioinversionistaverificacion: true },
      where: {
        servicioinversionistaverificacionid: servicioinversionistaverificacionid,
      },
    });

    return servicioinversionistaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioinversionistaverificacion = async (tx: TxClient, servicioinversionistaverificacion: Prisma.servicio_inversionista_verificacionCreateInput) => {
  try {
    const nuevo = await tx.servicio_inversionista_verificacion.create({ data: servicioinversionistaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioinversionistaverificacion = async (tx: TxClient, servicioinversionistaverificacionid: string, servicioinversionistaverificacion: Prisma.servicio_inversionista_verificacionUpdateInput) => {
  try {
    const result = await tx.servicio_inversionista_verificacion.update({
      data: servicioinversionistaverificacion,
      where: {
        servicioinversionistaverificacionid: servicioinversionistaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioinversionistaverificacion = async (tx: TxClient, servicioinversionistaverificacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio_inversionista_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioinversionistaverificacionid: servicioinversionistaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
