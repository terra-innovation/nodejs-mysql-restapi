import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFacturas = async (tx: TxClient, estados: number[]) => {
  try {
    const facturas = await tx.factura.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturasByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const facturas = await tx.factura.findMany({
      include: {
        archivo_facturas: {
          include: {
            archivo: {
              include: {
                archivo_tipo: true,
                archivo_estado: true,
              },
            },
          },
        },
        factoring_facturas: true,
        factura_impuestos: true,
        factura_itemes: true,
        factura_medio_pagos: true,
        factura_notas: true,
        factura_termino_pagos: true,
        usuario_upload: true,
      },
      where: {
        estado: {
          in: estados,
        },
        factoring_facturas: {
          some: {
            idfactoring: idfactoring,
          },
        },
      },
    });
    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturasActivas = async (tx: TxClient) => {
  try {
    const facturas = await tx.factura.findMany({
      where: {
        estado: 1,
      },
    });

    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfactura = async (tx: TxClient, idfactura: number) => {
  try {
    const factura = await tx.factura.findUnique({ where: { idfactura: idfactura } });

    //const facturas = await factura.getFacturas();

    return factura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfacturaAndIdusuarioupload = async (tx: TxClient, idfactura, idusuarioupload) => {
  try {
    const factura = await tx.factura.findFirst({
      where: {
        idfactura: idfactura,
        idusuarioupload: idusuarioupload,
      },
    });

    return factura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByFacturaid = async (tx: TxClient, facturaid: string) => {
  try {
    const factura = await tx.factura.findFirst({
      where: {
        facturaid: facturaid,
      },
    });

    return factura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaPk = async (tx: TxClient, facturaid: string) => {
  try {
    const factura = await tx.factura.findFirst({
      select: { idfactura: true },
      where: {
        facturaid: facturaid,
      },
    });

    return factura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactura = async (tx: TxClient, factura: Prisma.facturaCreateInput) => {
  try {
    const nuevo = await tx.factura.create({ data: factura });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactura = async (tx: TxClient, facturaid: string, factura: Prisma.facturaUpdateInput) => {
  try {
    const result = await tx.factura.update({
      data: factura,
      where: {
        facturaid: facturaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactura = async (tx: TxClient, facturaid: string, factura: Prisma.facturaUpdateInput) => {
  try {
    const result = await tx.factura.update({
      data: factura,
      where: {
        facturaid: facturaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactura = async (tx: TxClient, facturaid: string, factura: Prisma.facturaUpdateInput) => {
  try {
    const result = await tx.factura.update({
      data: factura,
      where: {
        facturaid: facturaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
