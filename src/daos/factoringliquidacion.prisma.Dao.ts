import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringliquidacionAceptadaByIdfactoringliquidacion = async (tx: TxClient, idfactoringliquidacion: number, estados: number[]) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findFirst({
      include: {
        factoring: true,

        factoring_liquidacion_estado: true,
        factoring_liquidacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
      },
      where: {
        idfactoringliquidacion: idfactoringliquidacion,
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionVigenteByIdfactoringliquidacionIdfactoring = async (tx: TxClient, idfactoringliquidacion: number, idfactoring: number, estados: number[]) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findFirst({
      include: {
        factoring: true,

        factoring_liquidacion_estado: true,
        factoring_liquidacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        idfactoringliquidacion: idfactoringliquidacion,
        idfactoringliquidacionestado: 4,
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionVigenteByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findFirst({
      include: {
        factoring: true,

        factoring_liquidacion_estado: true,
        factoring_liquidacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        idfactoringliquidacionestado: 4,
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionsByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const factoringliquidacions = await tx.factoring_liquidacion.findMany({
      include: {
        factoring_liquidacion_estado: true,
        factoring_liquidacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacions = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringliquidacions = await tx.factoring_liquidacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringliquidacions;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionByIdfactoringliquidacion = async (tx: TxClient, idfactoringliquidacion: number) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findUnique({
      where: {
        idfactoringliquidacion: idfactoringliquidacion,
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringliquidacionByFactoringliquidacionid = async (tx: TxClient, factoringliquidacionid: string) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findUnique({
      include: {
        factoring: true,

        factoring_liquidacion_estado: true,
        factoring_liquidacion_financieros: {
          include: {
            financiero_concepto: true,
            financiero_tipo: true,
          },
        },
      },
      where: {
        factoringliquidacionid: factoringliquidacionid,
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringliquidacionPk = async (tx: TxClient, factoringliquidacionid: string) => {
  try {
    const factoringliquidacion = await tx.factoring_liquidacion.findUnique({
      select: { idfactoringliquidacion: true },
      where: {
        factoringliquidacionid: factoringliquidacionid,
      },
    });

    return factoringliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringliquidacion = async (tx: TxClient, factoringliquidacion: Prisma.factoring_liquidacionCreateInput) => {
  try {
    const nuevo = await tx.factoring_liquidacion.create({
      data: factoringliquidacion,
    });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringliquidacion = async (tx: TxClient, factoringliquidacionid: string, factoringliquidacion: Prisma.factoring_liquidacionUpdateInput) => {
  try {
    const result = await tx.factoring_liquidacion.update({
      data: factoringliquidacion,
      where: {
        factoringliquidacionid: factoringliquidacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringliquidacion = async (tx: TxClient, factoringliquidacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_liquidacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringliquidacionid: factoringliquidacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringliquidacion = async (tx: TxClient, factoringliquidacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_liquidacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringliquidacionid: factoringliquidacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
