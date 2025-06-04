import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_config_comision } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringconfigcomisionByIdriesgo = async (tx: TxClient, idriesgo, estados: number[]) => {
  try {
    const factoringconfigcomision = await tx.factoring_config_comision.findFirst({
      where: {
        idriesgo: idriesgo,
        estado: {
          in: estados,
        },
      },
    });

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisions = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringconfigcomisions = await tx.factoring_config_comision.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringconfigcomisions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisionByIdfactoringconfigcomision = async (tx: TxClient, idfactoringconfigcomision: number) => {
  try {
    const factoringconfigcomision = await tx.factoring_config_comision.findUnique({ where: { idfactoringconfigcomision: idfactoringconfigcomision } });

    //const factoringconfigcomisions = await factoringconfigcomision.getFactoringconfigcomisions();

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigcomisionByFactoringconfigcomisionid = async (tx: TxClient, factoringconfigcomisionid: string) => {
  try {
    const factoringconfigcomision = await tx.factoring_config_comision.findFirst({
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
    });

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfigcomisionPk = async (tx: TxClient, factoringconfigcomisionid: string) => {
  try {
    const factoringconfigcomision = await tx.factoring_config_comision.findFirst({
      select: { idfactoringconfigcomision: true },
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
    });

    return factoringconfigcomision;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigcomision = async (tx: TxClient, factoringconfigcomision: Prisma.factoring_config_comisionCreateInput) => {
  try {
    const nuevo = await tx.factoring_config_comision.create({ data: factoringconfigcomision });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfigcomision = async (tx: TxClient, factoringconfigcomisionid: string, factoringconfigcomision: Prisma.factoring_config_comisionUpdateInput) => {
  try {
    const result = await tx.factoring_config_comision.update({
      data: factoringconfigcomision,
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfigcomision = async (tx: TxClient, factoringconfigcomisionid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_config_comision.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringconfigcomisionid: factoringconfigcomisionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
