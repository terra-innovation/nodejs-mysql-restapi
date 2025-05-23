import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, financiero_tipo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getComision = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 1);
};

export const getCosto = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 2);
};

export const getGasto = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 3);
};

export const getFinancierotipos = async (tx: TxClient, estados: number[]): Promise<financiero_tipo[]> => {
  try {
    const financierotipos = await tx.financiero_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return financierotipos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByIdfinancierotipo = async (tx: TxClient, idfinancierotipo: number): Promise<financiero_tipo> => {
  try {
    const financierotipo = await tx.financiero_tipo.findUnique({ where: { idfinancierotipo: idfinancierotipo } });

    //const financierotipos = await financierotipo.getFinancierotipos();

    return financierotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByFinancierotipoid = async (tx: TxClient, financierotipoid: string): Promise<financiero_tipo> => {
  try {
    const financierotipo = await tx.financiero_tipo.findFirst({
      where: {
        financierotipoid: financierotipoid,
      },
    });

    return financierotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancierotipoPk = async (tx: TxClient, financierotipoid: string): Promise<{ idfinancierotipo: number }> => {
  try {
    const financierotipo = await tx.financiero_tipo.findFirst({
      select: { idfinancierotipo: true },
      where: {
        financierotipoid: financierotipoid,
      },
    });

    return financierotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancierotipo = async (tx: TxClient, financierotipo: Prisma.financiero_tipoCreateInput): Promise<financiero_tipo> => {
  try {
    const nuevo = await tx.financiero_tipo.create({ data: financierotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancierotipo = async (tx: TxClient, financierotipo: Partial<financiero_tipo>): Promise<financiero_tipo> => {
  try {
    const result = await tx.financiero_tipo.update({
      data: financierotipo,
      where: {
        financierotipoid: financierotipo.financierotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancierotipo = async (tx: TxClient, financierotipo: Partial<financiero_tipo>): Promise<financiero_tipo> => {
  try {
    const result = await tx.financiero_tipo.update({
      data: financierotipo,
      where: {
        financierotipoid: financierotipo.financierotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
