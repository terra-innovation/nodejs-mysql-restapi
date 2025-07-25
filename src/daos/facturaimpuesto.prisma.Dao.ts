import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_impuesto } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFacturaimpuestos = async (tx: TxClient, estados: number[]) => {
  try {
    const facturaimpuestos = await tx.factura_impuesto.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturaimpuestos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByIdfacturaimpuesto = async (tx: TxClient, idfacturaimpuesto: number) => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findUnique({
      where: {
        idfacturaimpuesto: idfacturaimpuesto,
      },
    });
    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByFacturaimpuestoid = async (tx: TxClient, facturaimpuestoid: string) => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findFirst({
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaimpuestoPk = async (tx: TxClient, facturaimpuestoid: string) => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findFirst({
      select: { idfacturaimpuesto: true },
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaimpuesto = async (tx: TxClient, facturaimpuesto: Prisma.factura_impuestoCreateInput) => {
  try {
    const nuevo = await tx.factura_impuesto.create({ data: facturaimpuesto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaimpuesto = async (tx: TxClient, facturaimpuestoid: string, facturaimpuesto: Prisma.factura_impuestoUpdateInput) => {
  try {
    const result = await tx.factura_impuesto.update({
      data: facturaimpuesto,
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaimpuesto = async (tx: TxClient, facturaimpuestoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_impuesto.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
