import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getServicios = async (tx: TxClient, estados: number[]) => {
  try {
    const servicios = await tx.servicio.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicios;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByIdservicio = async (tx: TxClient, idservicio: number) => {
  try {
    const servicio = await tx.servicio.findUnique({ where: { idservicio: idservicio } });

    //const servicios = await servicio.getServicios();

    return servicio;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioByServicioid = async (tx: TxClient, servicioid: string) => {
  try {
    const servicio = await tx.servicio.findFirst({
      where: {
        servicioid: servicioid,
      },
    });

    return servicio;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioPk = async (tx: TxClient, servicioid: string) => {
  try {
    const servicio = await tx.servicio.findFirst({
      select: { idservicio: true },
      where: {
        servicioid: servicioid,
      },
    });

    return servicio;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicio = async (tx: TxClient, servicio: Prisma.servicioCreateInput) => {
  try {
    const nuevo = await tx.servicio.create({ data: servicio });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicio = async (tx: TxClient, servicioid: string, servicio: Prisma.servicioUpdateInput) => {
  try {
    const result = await tx.servicio.update({
      data: servicio,
      where: {
        servicioid: servicioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicio = async (tx: TxClient, servicioid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioid: servicioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateServicio = async (tx: TxClient, servicioid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        servicioid: servicioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
