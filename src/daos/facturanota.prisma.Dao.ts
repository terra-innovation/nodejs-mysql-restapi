import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_nota } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFacturanotas = async (tx: TxClient, estados: number[]) => {
  try {
    const facturanotas = await tx.factura_nota.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturanotas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByIdfacturanota = async (tx: TxClient, idfacturanota: number) => {
  try {
    const facturanota = await tx.factura_nota.findUnique({ where: { idfacturanota: idfacturanota } });

    //const facturanotas = await facturanota.getFacturanotas();

    return facturanota;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByFacturanotaid = async (tx: TxClient, facturanotaid: string) => {
  try {
    const facturanota = await tx.factura_nota.findFirst({
      where: {
        facturanotaid: facturanotaid,
      },
    });

    return facturanota;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturanotaPk = async (tx: TxClient, facturanotaid: string) => {
  try {
    const facturanota = await tx.factura_nota.findFirst({
      select: { idfacturanota: true },
      where: {
        facturanotaid: facturanotaid,
      },
    });

    return facturanota;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturanota = async (tx: TxClient, facturanota: Prisma.factura_notaCreateInput) => {
  try {
    const nuevo = await tx.factura_nota.create({ data: facturanota });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturanota = async (tx: TxClient, facturanotaid: string, facturanota: Prisma.factura_notaUpdateInput) => {
  try {
    const result = await tx.factura_nota.update({
      data: facturanota,
      where: {
        facturanotaid: facturanotaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturanota = async (tx: TxClient, facturanotaid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_nota.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturanotaid: facturanotaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
