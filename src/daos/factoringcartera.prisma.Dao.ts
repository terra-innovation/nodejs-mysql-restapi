import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringcarteras = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringcarteras = await tx.factoring_cartera.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
      orderBy: {
        orden: "asc",
      },
    });

    return factoringcarteras;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringcarteraByIdfactoringcartera = async (tx: TxClient, idfactoringcartera: number) => {
  try {
    const factoringcartera = await tx.factoring_cartera.findUnique({ where: { idfactoringcartera: idfactoringcartera } });

    //const factoringcarteras = await factoringcartera.getFactoringcarteras();

    return factoringcartera;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringcarteraByFactoringcarteraid = async (tx: TxClient, factoringcarteraid: string) => {
  try {
    const factoringcartera = await tx.factoring_cartera.findFirst({
      where: {
        factoringcarteraid: factoringcarteraid,
      },
    });

    return factoringcartera;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringcarteraPk = async (tx: TxClient, factoringcarteraid: string) => {
  try {
    const factoringcartera = await tx.factoring_cartera.findFirst({
      select: { idfactoringcartera: true },
      where: {
        factoringcarteraid: factoringcarteraid,
      },
    });

    return factoringcartera;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringcartera = async (tx: TxClient, factoringcartera: Prisma.factoring_carteraCreateInput) => {
  try {
    const nuevo = await tx.factoring_cartera.create({ data: factoringcartera });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringcartera = async (tx: TxClient, factoringcarteraid: string, factoringcartera: Prisma.factoring_carteraUpdateInput) => {
  try {
    const result = await tx.factoring_cartera.update({
      data: factoringcartera,
      where: {
        factoringcarteraid: factoringcarteraid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringcartera = async (tx: TxClient, factoringcarteraid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_cartera.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringcarteraid: factoringcarteraid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringcarteraResumen = async (tx: TxClient) => {
  try {
    const result = await tx.$queryRaw`
      SELECT 
          m.codigo AS moneda, 
          fc.code, 
          fc.estado1,  
          COALESCE(COUNT(f._idfactoring), 0) AS cantidad, 
          COALESCE(SUM(fp.monto_neto), 0) AS suma_monto_neto, 
          COALESCE(SUM(fp.monto_garantia), 0) AS suma_monto_garantia, 
          COALESCE(SUM(fp.monto_financiado), 0) AS suma_monto_financiado, 
          COALESCE(SUM(fp.monto_descuento), 0) AS suma_monto_descuento, 
          COALESCE(SUM(fp.monto_comision), 0) AS suma_monto_comision, 
          COALESCE(SUM(fp.monto_adelanto), 0) AS suma_monto_adelanto
      FROM factoring_cartera fc
      -- 1. Forzamos a que cada cartera exista para cada moneda del sistema
      CROSS JOIN moneda m 
      LEFT JOIN factoring_estado fe 
          ON fc._idfactoringcartera = fe._idfactoringcartera
      -- 2. Al unir factoring, aseguramos que coincida tanto el estado como la moneda de la fila actual
      LEFT JOIN factoring f 
          ON f._idfactoringestado = fe._idfactoringestado 
          AND f.estado IN (1)
          AND f._idmoneda = m._idmoneda 
      LEFT JOIN factoring_propuesta fp 
          ON fp._idfactoringpropuesta = f._idfactoringpropuestaaceptada
      WHERE fc._idfactoringcartera NOT IN (1)
      GROUP BY m.codigo, fc.code, fc.estado1, fc.orden
      ORDER BY m.codigo, fc.orden;
    `;
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
