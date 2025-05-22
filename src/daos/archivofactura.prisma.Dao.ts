import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_factura } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivofacturasByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]): Promise<archivo_factura[]> => {
  try {
    const archivofacturas = await tx.archivo_factura.findMany({
      include: {
        archivo: true,
        factura: {
          include: {
            factoring_facturas: {
              include: {
                factoring: true,
              },
            },
          },
        },
      },
      where: {
        estado: { in: estados },
        factura: {
          factoring_facturas: {
            some: {
              factoring: {
                idfactoring: idfactoring,
              },
            },
          },
        },
      },
    });

    return archivofacturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofacturas = async (tx: TxClient, estados: number[]): Promise<archivo_factura[]> => {
  try {
    const archivofacturas = await tx.archivo_factura.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivofacturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByIdarchivoIdfactura = async (tx: TxClient, idarchivo: number, idfactura: number): Promise<archivo_factura> => {
  try {
    const archivofactura = await tx.archivo_factura.findUnique({
      where: {
        idarchivo_idfactura: {
          idarchivo: idarchivo,
          idfactura: idfactura,
        },
      },
    });

    return archivofactura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoFacturaPk = async (tx: TxClient, archivofactura: Partial<archivo_factura>): Promise<{ idarchivo: number; idfactura: bigint } | null> => {
  try {
    const result = await tx.archivo_factura.findFirst({
      select: { idarchivo: true, idfactura: true },
      where: {
        idarchivo: archivofactura.idarchivo,
        idfactura: archivofactura.idfactura,
      },
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoFactura = async (tx: TxClient, archivofactura: Prisma.archivo_facturaCreateInput): Promise<archivo_factura> => {
  try {
    const nuevo = await tx.archivo_factura.create({ data: archivofactura });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoFactura = async (tx: TxClient, archivofactura: Partial<archivo_factura>): Promise<archivo_factura> => {
  try {
    const result = await tx.archivo_factura.update({
      data: archivofactura,
      where: {
        idarchivo_idfactura: {
          idarchivo: archivofactura.idarchivo,
          idfactura: archivofactura.idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoFactura = async (tx: TxClient, archivofactura: Partial<archivo_factura>): Promise<archivo_factura> => {
  try {
    const result = await tx.archivo_factura.update({
      data: archivofactura,
      where: {
        idarchivo_idfactura: {
          idarchivo: archivofactura.idarchivo,
          idfactura: archivofactura.idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoFactura = async (tx: TxClient, archivofactura: Partial<archivo_factura>): Promise<archivo_factura> => {
  try {
    const result = await tx.archivo_factura.update({
      data: archivofactura,
      where: {
        idarchivo_idfactura: {
          idarchivo: archivofactura.idarchivo,
          idfactura: archivofactura.idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
