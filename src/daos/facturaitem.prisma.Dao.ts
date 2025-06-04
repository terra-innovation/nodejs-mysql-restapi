import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factura_item } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFacturaitems = async (tx: TxClient, estados: number[]) => {
  try {
    const facturaitems = await tx.factura_item.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return facturaitems;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaitemByIdfacturaitem = async (tx: TxClient, idfacturaitem: number) => {
  try {
    const facturaitem = await tx.factura_item.findUnique({ where: { idfacturaitem: idfacturaitem } });

    //const facturaitems = await facturaitem.getFacturaitems();

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaitemByFacturaitemid = async (tx: TxClient, facturaitemid: string) => {
  try {
    const facturaitem = await tx.factura_item.findFirst({
      where: {
        facturaitemid: facturaitemid,
      },
    });

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaitemPk = async (tx: TxClient, facturaitemid: string) => {
  try {
    const facturaitem = await tx.factura_item.findFirst({
      select: { idfacturaitem: true },
      where: {
        facturaitemid: facturaitemid,
      },
    });

    return facturaitem;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFacturaitem = async (tx: TxClient, facturaitem: Prisma.factura_itemCreateInput) => {
  try {
    const nuevo = await tx.factura_item.create({ data: facturaitem });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFacturaitem = async (tx: TxClient, facturaitemid: string, facturaitem: Prisma.factura_itemUpdateInput) => {
  try {
    const result = await tx.factura_item.update({
      data: facturaitem,
      where: {
        facturaitemid: facturaitemid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFacturaitem = async (tx: TxClient, facturaitemid: string, idusuariomod: number) => {
  try {
    const result = await tx.factura_item.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        facturaitemid: facturaitemid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
