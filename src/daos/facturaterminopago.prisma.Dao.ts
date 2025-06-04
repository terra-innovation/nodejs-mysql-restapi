import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_termino_pago } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFacturaterminopagos = async (tx: TxClient, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByIdfacturaterminopago = async (tx: TxClient, idfacturaterminopago: number) => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findUnique({ where: { idfacturaterminopago: idfacturaterminopago } });

    //const facturaterminopagos = await facturaterminopago.getFacturaterminopagos();

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaterminopagoByFacturaterminopagoid = async (tx: TxClient, facturaterminopagoid: string) => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findFirst({
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaterminopagoPk = async (tx: TxClient, facturaterminopagoid: string) => {
  try {
    const facturaterminopago = await tx.factura_termino_pago.findFirst({
      select: { idfacturaterminopago: true },
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });

    return facturaterminopago;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaterminopago = async (tx: TxClient, facturaterminopago: Prisma.factura_termino_pagoCreateInput) => {
  try {
    const nuevo = await tx.factura_termino_pago.create({ data: facturaterminopago });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaterminopago = async (tx: TxClient, facturaterminopagoid: string, facturaterminopago: Prisma.factura_termino_pagoUpdateInput) => {
  try {
    const result = await tx.factura_termino_pago.update({
      data: facturaterminopago,
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaterminopago = async (tx: TxClient, facturaterminopagoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_termino_pago.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturaterminopagoid: facturaterminopagoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
