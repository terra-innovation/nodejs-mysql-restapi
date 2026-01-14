import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_simulacion } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringsimulacions = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringsimulacions = await tx.factoring_simulacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringsimulacions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsimulacionByIdfactoringsimulacion = async (tx: TxClient, idfactoringsimulacion: number) => {
  try {
    const factoringsimulacion = await tx.factoring_simulacion.findUnique({
      where: {
        idfactoringsimulacion: idfactoringsimulacion,
      },
    });

    return factoringsimulacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsimulacionByFactoringsimulacionid = async (tx: TxClient, factoringsimulacionid: string) => {
  try {
    const factoringsimulacion = await tx.factoring_simulacion.findUnique({
      include: {
        factoring_estrategia: true,
        factoring_simulacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
        factoring_tipo: true,
        banco: true,
        riesgo_operacion: true,
        moneda: true,
      },
      where: {
        factoringsimulacionid: factoringsimulacionid,
      },
    });

    return factoringsimulacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringsimulacionPk = async (tx: TxClient, factoringsimulacionid: string) => {
  try {
    const factoringsimulacion = await tx.factoring_simulacion.findUnique({
      select: { idfactoringsimulacion: true },
      where: {
        factoringsimulacionid: factoringsimulacionid,
      },
    });

    return factoringsimulacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringsimulacion = async (tx: TxClient, factoringsimulacion: Prisma.factoring_simulacionCreateInput) => {
  try {
    const nuevo = await tx.factoring_simulacion.create({
      data: factoringsimulacion,
    });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringsimulacion = async (tx: TxClient, factoringsimulacionid: string, factoringsimulacion: Prisma.factoring_simulacionUpdateInput) => {
  try {
    const result = await tx.factoring_simulacion.update({
      data: factoringsimulacion,
      where: {
        factoringsimulacionid: factoringsimulacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringsimulacion = async (tx: TxClient, factoringsimulacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_simulacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringsimulacionid: factoringsimulacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringsimulacion = async (tx: TxClient, factoringsimulacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_simulacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringsimulacionid: factoringsimulacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
