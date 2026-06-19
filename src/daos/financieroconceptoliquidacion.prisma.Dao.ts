import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFinancieroconceptoliquidacions = async (tx: TxClient, estados: number[]) => {
  try {
    const financieroconceptoliquidacions = await tx.financiero_concepto_liquidacion.findMany({
      include: {
        financiero_concepto: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return financieroconceptoliquidacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoliquidacionByIdfinancieroconceptoliquidacion = async (tx: TxClient, idfinancieroconceptoliquidacion: number) => {
  try {
    const financieroconceptoliquidacionliquidacion = await tx.financiero_concepto_liquidacion.findUnique({ where: { idfinancieroconceptoliquidacion: idfinancieroconceptoliquidacion } });

    //const financieroconceptoliquidacions = await financieroconceptoliquidacionliquidacion.getFinancieroconceptoliquidacions();

    return financieroconceptoliquidacionliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFinancieroconceptoliquidacionByFinancieroconceptoliquidacionid = async (tx: TxClient, financieroconceptoliquidacionid: string) => {
  try {
    const financieroconceptoliquidacionliquidacion = await tx.financiero_concepto_liquidacion.findFirst({
      where: {
        financieroconceptoliquidacionid: financieroconceptoliquidacionid,
      },
    });

    return financieroconceptoliquidacionliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFinancieroconceptoliquidacionPk = async (tx: TxClient, financieroconceptoliquidacionid: string) => {
  try {
    const financieroconceptoliquidacionliquidacion = await tx.financiero_concepto_liquidacion.findFirst({
      select: { idfinancieroconceptoliquidacion: true },
      where: {
        financieroconceptoliquidacionid: financieroconceptoliquidacionid,
      },
    });

    return financieroconceptoliquidacionliquidacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFinancieroconceptoliquidacion = async (tx: TxClient, financieroconceptoliquidacionliquidacion: Prisma.financiero_conceptoCreateInput) => {
  try {
    const nuevo = await tx.financiero_concepto_liquidacion.create({ data: financieroconceptoliquidacionliquidacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFinancieroconceptoliquidacion = async (tx: TxClient, financieroconceptoliquidacionid: string, financieroconceptoliquidacionliquidacion: Prisma.financiero_conceptoUpdateInput) => {
  try {
    const result = await tx.financiero_concepto_liquidacion.update({
      data: financieroconceptoliquidacionliquidacion,
      where: {
        financieroconceptoliquidacionid: financieroconceptoliquidacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFinancieroconceptoliquidacion = async (tx: TxClient, financieroconceptoliquidacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.financiero_concepto_liquidacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        financieroconceptoliquidacionid: financieroconceptoliquidacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
