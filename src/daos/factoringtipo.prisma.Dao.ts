import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_tipo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringtipos = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringtipos = await tx.factoring_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringtipos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByIdfactoringtipo = async (tx: TxClient, idfactoringtipo: number) => {
  try {
    const factoringtipo = await tx.factoring_tipo.findUnique({
      where: {
        idfactoringtipo: idfactoringtipo,
      },
    });

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByFactoringtipoid = async (tx: TxClient, factoringtipoid: string) => {
  try {
    const factoringtipo = await tx.factoring_tipo.findFirst({
      where: {
        factoringtipoid: factoringtipoid,
      },
    });

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtipoPk = async (tx: TxClient, factoringtipoid: string) => {
  try {
    const factoringtipo = await tx.factoring_tipo.findFirst({
      select: { idfactoringtipo: true },
      where: {
        factoringtipoid: factoringtipoid,
      },
    });

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtipo = async (tx: TxClient, factoringtipo: Prisma.factoring_tipoCreateInput) => {
  try {
    const nuevo = await tx.factoring_tipo.create({ data: factoringtipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtipo = async (tx: TxClient, factoringtipoid: string, factoringtipo: Prisma.factoring_tipoUpdateInput) => {
  try {
    const result = await tx.factoring_tipo.update({
      data: factoringtipo,
      where: {
        factoringtipoid: factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtipo = async (tx: TxClient, factoringtipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringtipoid: factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
