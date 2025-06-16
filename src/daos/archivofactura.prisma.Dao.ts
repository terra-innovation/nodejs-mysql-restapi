import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_factura } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivofacturasByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofacturas = async (tx: TxClient, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByIdarchivoIdfactura = async (tx: TxClient, idarchivo: number, idfactura: number) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoFacturaPk = async (tx: TxClient, archivofactura: Partial<archivo_factura>) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoFactura = async (tx: TxClient, archivofactura: Prisma.archivo_facturaCreateInput) => {
  try {
    const nuevo = await tx.archivo_factura.create({ data: archivofactura });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoFactura = async (tx: TxClient, idarchivo: number, idfactura: number, archivofactura: Prisma.archivo_facturaUpdateInput) => {
  try {
    const result = await tx.archivo_factura.update({
      data: archivofactura,
      where: {
        idarchivo_idfactura: {
          idarchivo: idarchivo,
          idfactura: idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoFactura = async (tx: TxClient, idarchivo: number, idfactura: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_factura.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idfactura: {
          idarchivo: idarchivo,
          idfactura: idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoFactura = async (tx: TxClient, idarchivo: number, idfactura: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_factura.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idarchivo_idfactura: {
          idarchivo: idarchivo,
          idfactura: idfactura,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
