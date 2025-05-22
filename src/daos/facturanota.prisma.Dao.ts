import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_nota } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturanotas = async (tx: TxClient, estados: number[]): Promise<factura_nota[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByIdfacturanota = async (tx: TxClient, idfacturanota: number): Promise<factura_nota> => {
  try {
    const facturanota = await tx.factura_nota.findUnique({ where: { idfacturanota: idfacturanota } });

    //const facturanotas = await facturanota.getFacturanotas();

    return facturanota;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturanotaByFacturanotaid = async (tx: TxClient, facturanotaid: string): Promise<factura_nota> => {
  try {
    const facturanota = await tx.factura_nota.findFirst({
      where: {
        facturanotaid: facturanotaid,
      },
    });

    return facturanota;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturanotaPk = async (tx: TxClient, facturanotaid: string): Promise<{ idfacturanota: number }> => {
  try {
    const facturanota = await tx.factura_nota.findFirst({
      select: { idfacturanota: true },
      where: {
        facturanotaid: facturanotaid,
      },
    });

    return facturanota;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturanota = async (tx: TxClient, facturanota: Prisma.factura_notaCreateInput): Promise<factura_nota> => {
  try {
    const nuevo = await tx.factura_nota.create({ data: facturanota });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturanota = async (tx: TxClient, facturanota: Partial<factura_nota>): Promise<factura_nota> => {
  try {
    const result = await tx.factura_nota.update({
      data: facturanota,
      where: {
        facturanotaid: facturanota.facturanotaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturanota = async (tx: TxClient, facturanota: Partial<factura_nota>): Promise<factura_nota> => {
  try {
    const result = await tx.factura_nota.update({
      data: facturanota,
      where: {
        facturanotaid: facturanota.facturanotaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
