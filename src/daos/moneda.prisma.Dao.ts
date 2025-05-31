import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, moneda } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getMonedas = async (tx: TxClient, estados: number[]) => {
  try {
    const monedas = await tx.moneda.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return monedas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByIdmoneda = async (tx: TxClient, idmoneda: number) => {
  try {
    const moneda = await tx.moneda.findUnique({ where: { idmoneda: idmoneda } });

    //const monedas = await moneda.getMonedas();

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByCodigo = async (tx: TxClient, codigo) => {
  try {
    const moneda = await tx.moneda.findFirst({
      where: {
        codigo: codigo,
      },
    });

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getMonedaByMonedaid = async (tx: TxClient, monedaid: string) => {
  try {
    const moneda = await tx.moneda.findFirst({
      where: {
        monedaid: monedaid,
      },
    });

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findMonedaPk = async (tx: TxClient, monedaid: string) => {
  try {
    const moneda = await tx.moneda.findFirst({
      select: { idmoneda: true },
      where: {
        monedaid: monedaid,
      },
    });

    return moneda;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertMoneda = async (tx: TxClient, moneda: Prisma.monedaCreateInput) => {
  try {
    const nuevo = await tx.moneda.create({ data: moneda });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateMoneda = async (tx: TxClient, monedaid: string, moneda: Prisma.monedaUpdateInput) => {
  try {
    const result = await tx.moneda.update({
      data: moneda,
      where: {
        monedaid: monedaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteMoneda = async (tx: TxClient, monedaid: string, moneda: Prisma.monedaUpdateInput) => {
  try {
    const result = await tx.moneda.update({
      data: moneda,
      where: {
        monedaid: monedaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
