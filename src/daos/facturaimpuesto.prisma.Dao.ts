import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_impuesto } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturaimpuestos = async (tx: TxClient, estados: number[]): Promise<factura_impuesto[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByIdfacturaimpuesto = async (tx: TxClient, idfacturaimpuesto: number): Promise<factura_impuesto> => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findUnique({ where: { idfacturaimpuesto: idfacturaimpuesto } });

    //const facturaimpuestos = await facturaimpuesto.getFacturaimpuestos();

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaimpuestoByFacturaimpuestoid = async (tx: TxClient, facturaimpuestoid: string): Promise<factura_impuesto> => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findFirst({
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaimpuestoPk = async (tx: TxClient, facturaimpuestoid: string): Promise<{ idfacturaimpuesto: number }> => {
  try {
    const facturaimpuesto = await tx.factura_impuesto.findFirst({
      select: { idfacturaimpuesto: true },
      where: {
        facturaimpuestoid: facturaimpuestoid,
      },
    });

    return facturaimpuesto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaimpuesto = async (tx: TxClient, facturaimpuesto: Prisma.factura_impuestoCreateInput): Promise<factura_impuesto> => {
  try {
    const nuevo = await tx.factura_impuesto.create({ data: facturaimpuesto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaimpuesto = async (tx: TxClient, facturaimpuesto: Partial<factura_impuesto>): Promise<factura_impuesto> => {
  try {
    const result = await tx.factura_impuesto.update({
      data: facturaimpuesto,
      where: {
        facturaimpuestoid: facturaimpuesto.facturaimpuestoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaimpuesto = async (tx: TxClient, facturaimpuesto: Partial<factura_impuesto>): Promise<factura_impuesto> => {
  try {
    const result = await tx.factura_impuesto.update({
      data: facturaimpuesto,
      where: {
        facturaimpuestoid: facturaimpuesto.facturaimpuestoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
