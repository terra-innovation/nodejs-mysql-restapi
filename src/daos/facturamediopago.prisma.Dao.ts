import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_medio_pago } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturamediopagos = async (tx: TxClient, estados: number[]) => {
  try {
    const facturamediopagos = await tx.factura_medio_pago.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturamediopagos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByIdfacturamediopago = async (tx: TxClient, idfacturamediopago: number) => {
  try {
    const facturamediopago = await tx.factura_medio_pago.findUnique({ where: { idfacturamediopago: idfacturamediopago } });

    //const facturamediopagos = await facturamediopago.getFacturamediopagos();

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByFacturamediopagoid = async (tx: TxClient, facturamediopagoid: string) => {
  try {
    const facturamediopago = await tx.factura_medio_pago.findFirst({
      where: {
        facturamediopagoid: facturamediopagoid,
      },
    });

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturamediopagoPk = async (tx: TxClient, facturamediopagoid: string) => {
  try {
    const facturamediopago = await tx.factura_medio_pago.findFirst({
      select: { idfacturamediopago: true },
      where: {
        facturamediopagoid: facturamediopagoid,
      },
    });

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturamediopago = async (tx: TxClient, facturamediopago: Prisma.factura_medio_pagoCreateInput) => {
  try {
    const nuevo = await tx.factura_medio_pago.create({ data: facturamediopago });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturamediopago = async (tx: TxClient, facturamediopago: Partial<factura_medio_pago>) => {
  try {
    const result = await tx.factura_medio_pago.update({
      data: facturamediopago,
      where: {
        facturamediopagoid: facturamediopago.facturamediopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturamediopago = async (tx: TxClient, facturamediopago: Partial<factura_medio_pago>) => {
  try {
    const result = await tx.factura_medio_pago.update({
      data: facturamediopago,
      where: {
        facturamediopagoid: facturamediopago.facturamediopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
