import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_factura } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringsfacturasEmpresasActivas = async (tx: TxClient) => {
  try {
    const factoringsfacturasempresas = await tx.factoring_factura.findMany({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
    });

    return factoringsfacturasempresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByIdfactoringfactura = async (tx: TxClient, idfactoringfactura: number): Promise<factoring_factura> => {
  try {
    const factoringfactura = await tx.factoring_factura.findUnique({ where: { idfactoringfactura: idfactoringfactura } });

    //const factoringsfacturasempresas = await factoringfactura.getFactoringsfacturasEmpresas();

    return factoringfactura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByFactoringfacturaid = async (tx: TxClient, factoringfactura) => {
  try {
    const result = await tx.factoring_factura.findFirst({
      where: {
        idfactoring: factoringfactura.idfactoring,
        idfactura: factoringfactura.idfactura,
      },
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturaPk = async (tx: TxClient, factoringfactura) => {
  try {
    const result = await tx.factoring_factura.findFirst({
      select: { idfactoringfactura: true },
      where: {
        idfactoring: factoringfactura.idfactoring,
        idfactura: factoringfactura.idfactura,
      },
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfactura = async (tx: TxClient, factoringfactura: Prisma.factoring_facturaCreateInput): Promise<factoring_factura> => {
  try {
    const nuevo = await tx.factoring_factura.create({ data: factoringfactura });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfactura = async (tx: TxClient, factoringfactura: Partial<factoring_factura>): Promise<factoring_factura> => {
  try {
    const result = await tx.factoring_factura.update({
      data: factoringfactura,
      where: {
        idfactoring: factoringfactura.idfactoring,
        idfactura: factoringfactura.idfactura,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfactura = async (tx: TxClient, factoringfactura: Partial<factoring_factura>): Promise<factoring_factura> => {
  try {
    const result = await tx.factoring_factura.update({
      data: factoringfactura,
      where: {
        idfactoring: factoringfactura.idfactoring,
        idfactura: factoringfactura.idfactura,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
