import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getArchivoservicioempresaverificacions = async (tx: TxClient, estados: number[]) => {
  try {
    const archivoservicioempresaverificacions = await tx.archivo_servicio_empresa_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivoservicioempresaverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoservicioempresaverificacionByIdarchivoservicioempresaverificacion = async (tx: TxClient, idarchivo: number, idservicioempresaverificacion: number) => {
  try {
    const archivoservicioempresaverificacion = await tx.archivo_servicio_empresa_verificacion.findUnique({
      where: {
        idarchivo_idservicioempresaverificacion: {
          idarchivo: idarchivo,
          idservicioempresaverificacion: idservicioempresaverificacion,
        },
      },
    });

    return archivoservicioempresaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoservicioempresaverificacion = async (tx: TxClient, archivoservicioempresaverificacion: Prisma.archivo_servicio_empresa_verificacionCreateInput) => {
  try {
    const nuevo = await tx.archivo_servicio_empresa_verificacion.create({ data: archivoservicioempresaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoservicioempresaverificacion = async (tx: TxClient, idarchivo: number, idservicioempresaverificacion: number, archivoservicioempresaverificacion: Prisma.archivo_servicio_empresa_verificacionUpdateInput) => {
  try {
    const result = await tx.archivo_servicio_empresa_verificacion.update({
      data: archivoservicioempresaverificacion,
      where: {
        idarchivo_idservicioempresaverificacion: {
          idarchivo: idarchivo,
          idservicioempresaverificacion: idservicioempresaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoservicioempresaverificacion = async (tx: TxClient, idarchivo: number, idservicioempresaverificacion: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_servicio_empresa_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idservicioempresaverificacion: {
          idarchivo: idarchivo,
          idservicioempresaverificacion: idservicioempresaverificacion,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
