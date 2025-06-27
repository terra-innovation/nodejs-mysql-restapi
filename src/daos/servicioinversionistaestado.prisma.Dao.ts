import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_inversionista_estado } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getServicioinversionistaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const servicioinversionistaestados = await tx.servicio_inversionista_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioinversionistaestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaestadoByIdservicioinversionistaestado = async (tx: TxClient, idservicioinversionistaestado: number) => {
  try {
    const servicioinversionistaestado = await tx.servicio_inversionista_estado.findUnique({ where: { idservicioinversionistaestado: idservicioinversionistaestado } });

    //const servicioinversionistaestados = await servicioinversionistaestado.getServicioinversionistaestados();

    return servicioinversionistaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaestadoByServicioinversionistaestadoid = async (tx: TxClient, servicioinversionistaestadoid: string) => {
  try {
    const servicioinversionistaestado = await tx.servicio_inversionista_estado.findFirst({
      where: {
        servicioinversionistaestadoid: servicioinversionistaestadoid,
      },
    });

    return servicioinversionistaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioinversionistaestadoPk = async (tx: TxClient, servicioinversionistaestadoid: string) => {
  try {
    const servicioinversionistaestado = await tx.servicio_inversionista_estado.findFirst({
      select: { idservicioinversionistaestado: true },
      where: {
        servicioinversionistaestadoid: servicioinversionistaestadoid,
      },
    });

    return servicioinversionistaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioinversionistaestado = async (tx: TxClient, servicioinversionistaestado: Prisma.servicio_inversionista_estadoCreateInput) => {
  try {
    const nuevo = await tx.servicio_inversionista_estado.create({ data: servicioinversionistaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioinversionistaestado = async (tx: TxClient, servicioinversionistaestadoid: string, servicioinversionistaestado: Prisma.servicio_inversionista_estadoUpdateInput) => {
  try {
    const result = await tx.servicio_inversionista_estado.update({
      data: servicioinversionistaestado,
      where: {
        servicioinversionistaestadoid: servicioinversionistaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioinversionistaestado = async (tx: TxClient, servicioinversionistaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio_inversionista_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioinversionistaestadoid: servicioinversionistaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
