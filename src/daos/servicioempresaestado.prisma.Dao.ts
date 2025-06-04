import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_empresa_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getServicioempresaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const servicioempresaestados = await tx.servicio_empresa_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioempresaestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByIdservicioempresaestado = async (tx: TxClient, idservicioempresaestado: number) => {
  try {
    const servicioempresaestado = await tx.servicio_empresa_estado.findUnique({ where: { idservicioempresaestado: idservicioempresaestado } });

    //const servicioempresaestados = await servicioempresaestado.getServicioempresaestados();

    return servicioempresaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaestadoByServicioempresaestadoid = async (tx: TxClient, servicioempresaestadoid: string) => {
  try {
    const servicioempresaestado = await tx.servicio_empresa_estado.findFirst({
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });

    return servicioempresaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaestadoPk = async (tx: TxClient, servicioempresaestadoid: string) => {
  try {
    const servicioempresaestado = await tx.servicio_empresa_estado.findFirst({
      select: { idservicioempresaestado: true },
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });

    return servicioempresaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresaestado = async (tx: TxClient, servicioempresaestado: Prisma.servicio_empresa_estadoCreateInput) => {
  try {
    const nuevo = await tx.servicio_empresa_estado.create({ data: servicioempresaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresaestado = async (tx: TxClient, servicioempresaestadoid: string, servicioempresaestado: Prisma.servicio_empresa_estadoUpdateInput) => {
  try {
    const result = await tx.servicio_empresa_estado.update({
      data: servicioempresaestado,
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresaestado = async (tx: TxClient, servicioempresaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio_empresa_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioempresaestadoid: servicioempresaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
