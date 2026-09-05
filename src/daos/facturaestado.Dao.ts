import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFacturaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const facturaestados = await tx.factura_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturaestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaestadoByIdfacturaestado = async (tx: TxClient, idfacturaestado: number) => {
  try {
    const facturaestado = await tx.factura_estado.findUnique({ where: { idfacturaestado: idfacturaestado } });

    //const facturaestados = await facturaestado.getFacturaestados();

    return facturaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaestadoByFacturaestadoid = async (tx: TxClient, facturaestadoid: string) => {
  try {
    const facturaestado = await tx.factura_estado.findFirst({
      where: {
        facturaestadoid: facturaestadoid,
      },
    });

    return facturaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaestadoPk = async (tx: TxClient, facturaestadoid: string) => {
  try {
    const facturaestado = await tx.factura_estado.findFirst({
      select: { idfacturaestado: true },
      where: {
        facturaestadoid: facturaestadoid,
      },
    });

    return facturaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaestado = async (tx: TxClient, facturaestado: Prisma.factura_estadoCreateInput) => {
  try {
    const nuevo = await tx.factura_estado.create({ data: facturaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaestado = async (tx: TxClient, facturaestadoid: string, facturaestado: Prisma.factura_estadoUpdateInput) => {
  try {
    const result = await tx.factura_estado.update({
      data: facturaestado,
      where: {
        facturaestadoid: facturaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaestado = async (tx: TxClient, facturaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturaestadoid: facturaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
