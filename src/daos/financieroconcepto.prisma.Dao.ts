import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, financiero_concepto } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getComisionFinanzaTech = async (tx: TxClient) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(tx, 1);
};

export const getCostoCAVALI = async (tx: TxClient) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(tx, 2);
};

export const getCostoTransaccion = async (tx: TxClient) => {
  return await getFinancieroconceptoByIdfinancieroconcepto(tx, 3);
};

export const getFinancieroconceptos = async (tx: TxClient, estados: number[]) => {
  try {
    const financieroconceptos = await tx.financiero_concepto.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return financieroconceptos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoByIdfinancieroconcepto = async (tx: TxClient, idfinancieroconcepto: number) => {
  try {
    const financieroconcepto = await tx.financiero_concepto.findUnique({ where: { idfinancieroconcepto: idfinancieroconcepto } });

    //const financieroconceptos = await financieroconcepto.getFinancieroconceptos();

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoByFinancieroconceptoid = async (tx: TxClient, financieroconceptoid: string) => {
  try {
    const financieroconcepto = await tx.financiero_concepto.findFirst({
      where: {
        financieroconceptoid: financieroconceptoid,
      },
    });

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancieroconceptoPk = async (tx: TxClient, financieroconceptoid: string) => {
  try {
    const financieroconcepto = await tx.financiero_concepto.findFirst({
      select: { idfinancieroconcepto: true },
      where: {
        financieroconceptoid: financieroconceptoid,
      },
    });

    return financieroconcepto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancieroconcepto = async (tx: TxClient, financieroconcepto: Prisma.financiero_conceptoCreateInput) => {
  try {
    const nuevo = await tx.financiero_concepto.create({ data: financieroconcepto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancieroconcepto = async (tx: TxClient, financieroconceptoid: string, financieroconcepto: Prisma.financiero_conceptoUpdateInput) => {
  try {
    const result = await tx.financiero_concepto.update({
      data: financieroconcepto,
      where: {
        financieroconceptoid: financieroconceptoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancieroconcepto = async (tx: TxClient, financieroconceptoid: string, financieroconcepto: Prisma.financiero_conceptoUpdateInput) => {
  try {
    const result = await tx.financiero_concepto.update({
      data: financieroconcepto,
      where: {
        financieroconceptoid: financieroconceptoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
