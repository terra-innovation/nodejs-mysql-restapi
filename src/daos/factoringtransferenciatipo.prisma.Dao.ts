import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_transferencia_tipo } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringtransferenciatipos = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringtransferenciatipos = await tx.factoring_transferencia_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringtransferenciatipos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciatipoByIdfactoringtransferenciatipo = async (tx: TxClient, idfactoringtransferenciatipo: number) => {
  try {
    const factoringtransferenciatipo = await tx.factoring_transferencia_tipo.findUnique({
      where: {
        idfactoringtransferenciatipo: idfactoringtransferenciatipo,
      },
    });

    return factoringtransferenciatipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciatipoByFactoringtransferenciatipoid = async (tx: TxClient, factoringtransferenciatipoid: string) => {
  try {
    const factoringtransferenciatipo = await tx.factoring_transferencia_tipo.findFirst({
      where: {
        factoringtransferenciatipoid: factoringtransferenciatipoid,
      },
    });

    return factoringtransferenciatipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtransferenciatipoPk = async (tx: TxClient, factoringtransferenciatipoid: string) => {
  try {
    const factoringtransferenciatipo = await tx.factoring_transferencia_tipo.findFirst({
      select: { idfactoringtransferenciatipo: true },
      where: {
        factoringtransferenciatipoid: factoringtransferenciatipoid,
      },
    });

    return factoringtransferenciatipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtransferenciatipo = async (tx: TxClient, factoringtransferenciatipo: Prisma.factoring_transferencia_tipoCreateInput) => {
  try {
    const nuevo = await tx.factoring_transferencia_tipo.create({ data: factoringtransferenciatipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtransferenciatipo = async (tx: TxClient, factoringtransferenciatipoid: string, factoringtransferenciatipo: Prisma.factoring_transferencia_tipoUpdateInput) => {
  try {
    const result = await tx.factoring_transferencia_tipo.update({
      data: factoringtransferenciatipo,
      where: {
        factoringtransferenciatipoid: factoringtransferenciatipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtransferenciatipo = async (tx: TxClient, factoringtransferenciatipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_transferencia_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringtransferenciatipoid: factoringtransferenciatipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
