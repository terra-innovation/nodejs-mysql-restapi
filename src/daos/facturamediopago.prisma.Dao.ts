import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_medio_pago } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturamediopagoByIdfacturamediopago = async (tx: TxClient, idfacturamediopago: number) => {
  try {
    const facturamediopago = await tx.factura_medio_pago.findUnique({ where: { idfacturamediopago: idfacturamediopago } });

    //const facturamediopagos = await facturamediopago.getFacturamediopagos();

    return facturamediopago;
  } catch (error) {
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturamediopago = async (tx: TxClient, facturamediopago: Prisma.factura_medio_pagoCreateInput) => {
  try {
    const nuevo = await tx.factura_medio_pago.create({ data: facturamediopago });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturamediopago = async (tx: TxClient, facturamediopagoid: string, facturamediopago: Prisma.factura_medio_pagoUpdateInput) => {
  try {
    const result = await tx.factura_medio_pago.update({
      data: facturamediopago,
      where: {
        facturamediopagoid: facturamediopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturamediopago = async (tx: TxClient, facturamediopagoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_medio_pago.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturamediopagoid: facturamediopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
