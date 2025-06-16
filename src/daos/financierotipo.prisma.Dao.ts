import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, financiero_tipo } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getComision = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 1);
};

export const getCosto = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 2);
};

export const getGasto = async (tx: TxClient) => {
  return await getFinancierotipoByIdfinancierotipo(tx, 3);
};

export const getFinancierotipos = async (tx: TxClient, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByIdfinancierotipo = async (tx: TxClient, idfinancierotipo: number) => {
  try {
    const financierotipo = await tx.financiero_tipo.findUnique({ where: { idfinancierotipo: idfinancierotipo } });

    //const financierotipos = await financierotipo.getFinancierotipos();

    return financierotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancierotipoByFinancierotipoid = async (tx: TxClient, financierotipoid: string) => {
  try {
    const financierotipo = await tx.financiero_tipo.findFirst({
      where: {
        financierotipoid: financierotipoid,
      },
    });

    return financierotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancierotipoPk = async (tx: TxClient, financierotipoid: string) => {
  try {
    const financierotipo = await tx.financiero_tipo.findFirst({
      select: { idfinancierotipo: true },
      where: {
        financierotipoid: financierotipoid,
      },
    });

    return financierotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancierotipo = async (tx: TxClient, financierotipo: Prisma.financiero_tipoCreateInput) => {
  try {
    const nuevo = await tx.financiero_tipo.create({ data: financierotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancierotipo = async (tx: TxClient, financierotipoid: string, financierotipo: Prisma.financiero_tipoUpdateInput) => {
  try {
    const result = await tx.financiero_tipo.update({
      data: financierotipo,
      where: {
        financierotipoid: financierotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancierotipo = async (tx: TxClient, financierotipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.financiero_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        financierotipoid: financierotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
