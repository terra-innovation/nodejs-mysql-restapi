import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_config_garantia } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringconfiggarantias = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringconfiggarantias = await tx.factoring_config_garantia.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringconfiggarantias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByIdfactoringconfiggarantia = async (tx: TxClient, idfactoringconfiggarantia: number) => {
  try {
    const factoringconfiggarantia = await tx.factoring_config_garantia.findUnique({ where: { idfactoringconfiggarantia: idfactoringconfiggarantia } });

    //const factoringconfiggarantias = await factoringconfiggarantia.getFactoringconfiggarantias();

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfiggarantiaByFactoringconfiggarantiaid = async (tx: TxClient, factoringconfiggarantiaid: string) => {
  try {
    const factoringconfiggarantia = await tx.factoring_config_garantia.findFirst({
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
    });

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfiggarantiaPk = async (tx: TxClient, factoringconfiggarantiaid: string) => {
  try {
    const factoringconfiggarantia = await tx.factoring_config_garantia.findFirst({
      select: { idfactoringconfiggarantia: true },
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
    });

    return factoringconfiggarantia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfiggarantia = async (tx: TxClient, factoringconfiggarantia: Prisma.factoring_config_garantiaCreateInput) => {
  try {
    const nuevo = await tx.factoring_config_garantia.create({ data: factoringconfiggarantia });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfiggarantia = async (tx: TxClient, factoringconfiggarantiaid: string, factoringconfiggarantia: Prisma.factoring_config_garantiaUpdateInput) => {
  try {
    const result = await tx.factoring_config_garantia.update({
      data: factoringconfiggarantia,
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfiggarantia = async (tx: TxClient, factoringconfiggarantiaid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_config_garantia.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringconfiggarantiaid: factoringconfiggarantiaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
