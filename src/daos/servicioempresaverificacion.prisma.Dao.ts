import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_empresa_verificacion } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getServicioempresaverificacions = async (tx: TxClient, estados: number[]): Promise<servicio_empresa_verificacion[]> => {
  try {
    const servicioempresaverificacions = await tx.servicio_empresa_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioempresaverificacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByIdservicioempresaverificacion = async (tx: TxClient, idservicioempresaverificacion: number): Promise<servicio_empresa_verificacion> => {
  try {
    const servicioempresaverificacion = await tx.servicio_empresa_verificacion.findUnique({
      where: {
        idservicioempresaverificacion: idservicioempresaverificacion,
      },
    });

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaverificacionByServicioempresaverificacionid = async (tx: TxClient, servicioempresaverificacionid: string): Promise<servicio_empresa_verificacion> => {
  try {
    const servicioempresaverificacion = await tx.servicio_empresa_verificacion.findFirst({
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
    });

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaverificacionPk = async (tx: TxClient, servicioempresaverificacionid: string): Promise<{ idservicioempresaverificacion: number }> => {
  try {
    const servicioempresaverificacion = await tx.servicio_empresa_verificacion.findFirst({
      select: { idservicioempresaverificacion: true },
      where: {
        servicioempresaverificacionid: servicioempresaverificacionid,
      },
    });

    return servicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaverificacion = async (tx: TxClient, servicioempresaverificacion: Prisma.servicio_empresa_verificacionCreateInput): Promise<servicio_empresa_verificacion> => {
  try {
    const nuevo = await tx.servicio_empresa_verificacion.create({ data: servicioempresaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaverificacion = async (tx: TxClient, servicioempresaverificacion: Partial<servicio_empresa_verificacion>): Promise<servicio_empresa_verificacion> => {
  try {
    const result = await tx.servicio_empresa_verificacion.update({
      data: servicioempresaverificacion,
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaverificacion = async (tx: TxClient, servicioempresaverificacion: Partial<servicio_empresa_verificacion>): Promise<servicio_empresa_verificacion> => {
  try {
    const result = await tx.servicio_empresa_verificacion.update({
      data: servicioempresaverificacion,
      where: {
        servicioempresaverificacionid: servicioempresaverificacion.servicioempresaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
