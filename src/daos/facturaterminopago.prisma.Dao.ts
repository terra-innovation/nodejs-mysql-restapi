import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_termino_pago } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturaterminopagos = async (tx: TxClient, estados: number[]): Promise<factura_termino_pago[]> => {
  try {
    const facturaterminopagos = await tx.factura_termino_pago.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturaterminopagos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByIdfacturaterminopago = async (tx: TxClient, idfacturaterminopago: number): Promise<factura_termino_pago> => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findUnique({ where: { idfacturaterminopago: idfacturaterminopago } });

    //const facturaterminopagos = await facturaterminopago.getFacturaterminopagos();

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByFacturaterminopagoid = async (tx: TxClient, facturaterminopagoid: string): Promise<factura_termino_pago> => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findFirst({
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaterminopagoPk = async (tx: TxClient, facturaterminopagoid: string): Promise<{ idfacturaterminopago: bigint }> => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findFirst({
      select: { idfacturaterminopago: true },
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaterminopago = async (tx: TxClient, facturaterminopago: Prisma.factura_termino_pagoCreateInput): Promise<factura_termino_pago> => {
  try {
    const nuevo = await tx.factura_termino_pago.create({ data: facturaterminopago });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaterminopago = async (tx: TxClient, facturaterminopago: Partial<factura_termino_pago>): Promise<factura_termino_pago> => {
  try {
    const result = await tx.factura_termino_pago.update({
      data: facturaterminopago,
      where: {
        facturaterminopagoid: facturaterminopago.facturaterminopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaterminopago = async (tx: TxClient, facturaterminopago: Partial<factura_termino_pago>): Promise<factura_termino_pago> => {
  try {
    const result = await tx.factura_termino_pago.update({
      data: facturaterminopago,
      where: {
        facturaterminopagoid: facturaterminopago.facturaterminopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
