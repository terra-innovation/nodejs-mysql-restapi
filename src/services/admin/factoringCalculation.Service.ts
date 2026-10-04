import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { calculateFactoringPeriod, calculateFactoringV1, calculateFactoringV2, calculateFactoringV3 } from "#root/src/domain/factoring/factoring.Calculator.js";

import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as factoringconfigcomisionDao from "#root/src/daos/factoringconfigcomision.Dao.js";
import * as financieroconceptoDao from "#root/src/daos/financieroconcepto.Dao.js";
import * as financierotipoDao from "#root/src/daos/financierotipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import type { Simulacion } from "#root/src/types/Simulacion.types.js";

import { line, log } from "#root/src/utils/logger.pino.js";

import type { DateTime } from "luxon";

export const simulateFactoringLogicV4 = async (idriesgooperacion: number, idbancocedente: number, cantidad_facturas: number, monto_neto: Prisma.Decimal, fecha_ahora: DateTime, fecha_fin: DateTime, fecha_emision: DateTime, porcentaje_financiado: Prisma.Decimal, tdm: Prisma.Decimal, porcentaje_comision_descuento: Prisma.Decimal, idmoneda: number): Promise<Partial<Simulacion>> => {
  log.debug(line(), "logic::simulateFactoringLogicV4");

  const periodo = calculateFactoringPeriod(fecha_ahora, fecha_fin, fecha_emision);
  const { dias_pago_estimado, dias_antiguedad_estimado } = periodo;

  const simulacion = await simulateFactoringLogicV3(idriesgooperacion, idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_financiado, tdm, dias_antiguedad_estimado, porcentaje_comision_descuento, idmoneda);

  Object.assign(simulacion, periodo);

  return simulacion;
};

export const simulateFactoringLogicV3 = async (idriesgooperacion: number, idbancocedente: number, cantidad_facturas: number, monto_neto: Prisma.Decimal, dias_pago_estimado: number, porcentaje_financiado: Prisma.Decimal, tdm: Prisma.Decimal, dias_antiguedad_estimado: number, porcentaje_comision_descuento: Prisma.Decimal, idmoneda: number): Promise<Partial<Simulacion>> => {
  log.debug(line(), "logic::simulateFactoringLogicV3");

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const constante_igv = await configuracionappDao.getIGV(tx);
      const constante_costo_cavali_pen = await configuracionappDao.getCostoCAVALIPen(tx);
      const constante_costo_cavali_usd = await configuracionappDao.getCostoCAVALIUsd(tx);
      const constante_comison_bcp_pen = await configuracionappDao.getComisionBCPPen(tx);
      const constante_comison_bcp_usd = await configuracionappDao.getComisionBCPUsd(tx);

      const riesgooperacion = await riesgoDao.getRiesgoByIdriesgo(tx, idriesgooperacion);
      const cofigcomision = await factoringconfigcomisionDao.getFactoringconfigcomisionByIdriesgo(tx, riesgooperacion.idriesgo, [1]);
      const financiero_tipo_comision = await financierotipoDao.getComision(tx);
      const financiero_tipo_costo = await financierotipoDao.getCosto(tx);
      const financiero_tipo_gasto = await financierotipoDao.getGasto(tx);
      const financiero_tipo_gasto_excento_igv = await financierotipoDao.getGasto_excento_igv(tx);

      const financiero_concepto_comisionft = await financieroconceptoDao.getComisionFinanzaTech(tx);
      const financiero_concepto_cavali = await financieroconceptoDao.getCostoCAVALIPen(tx);
      const financiero_concepto_transaccion = await financieroconceptoDao.getCostoTransaccion(tx);
      const financiero_concepto_gasto_interbancario = await financieroconceptoDao.getGastoInterbancario(tx);

      return calculateFactoringV3(
        {
          idbancocedente,
          cantidad_facturas,
          monto_neto,
          dias_pago_estimado,
          porcentaje_financiado,
          tdm,
          dias_antiguedad_estimado,
          porcentaje_comision_descuento,
          idmoneda,
        },
        {
          constante_igv,
          constante_costo_cavali_pen,
          constante_comison_bcp_pen,
          cofigcomision,
          financiero_tipo_comision,
          financiero_tipo_costo,
          financiero_concepto_comisionft,
          financiero_concepto_cavali,
          constante_costo_cavali_usd,
          constante_comison_bcp_usd,
          financiero_tipo_gasto_excento_igv,
          financiero_concepto_gasto_interbancario,
        },
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
  return simulacion;
};

export const simulateFactoringLogicV2 = async (idriesgooperacion: number, idbancocedente: number, cantidad_facturas: number, monto_neto: Prisma.Decimal, dias_pago_estimado: number, porcentaje_financiado: Prisma.Decimal, tdm: Prisma.Decimal, dias_antiguedad_estimado: number): Promise<Partial<Simulacion>> => {
  log.debug(line(), "logic::simulateFactoringLogicV2");

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const constante_igv = await configuracionappDao.getIGV(tx);
      const constante_costo_cavali_pen = await configuracionappDao.getCostoCAVALIPen(tx);
      const constante_comison_bcp_pen = await configuracionappDao.getComisionBCPPen(tx);

      const riesgooperacion = await riesgoDao.getRiesgoByIdriesgo(tx, idriesgooperacion);
      const cofigcomision = await factoringconfigcomisionDao.getFactoringconfigcomisionByIdriesgo(tx, riesgooperacion.idriesgo, [1]);
      const financiero_tipo_comision = await financierotipoDao.getComision(tx);
      const financiero_tipo_costo = await financierotipoDao.getCosto(tx);
      const financiero_tipo_gasto = await financierotipoDao.getGasto(tx);

      const financiero_concepto_comisionft = await financieroconceptoDao.getComisionFinanzaTech(tx);
      const financiero_concepto_cavali = await financieroconceptoDao.getCostoCAVALIPen(tx);
      const financiero_concepto_transaccion = await financieroconceptoDao.getCostoTransaccion(tx);

      return calculateFactoringV2(
        {
          idbancocedente,
          cantidad_facturas,
          monto_neto,
          dias_pago_estimado,
          porcentaje_financiado,
          tdm,
          dias_antiguedad_estimado,
        },
        {
          constante_igv,
          constante_costo_cavali_pen,
          constante_comison_bcp_pen,
          cofigcomision,
          financiero_tipo_comision,
          financiero_tipo_costo,
          financiero_concepto_comisionft,
          financiero_concepto_cavali,
        },
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
  return simulacion;
};

export const simulateFactoringLogicV1 = async (_idriesgooperacion, _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_adelanto, tnm) => {
  log.debug(line(), "logic::simulateFactoringLogicV1");

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const riesgooperacion = await riesgoDao.getRiesgoByIdriesgo(tx, _idriesgooperacion);
      return calculateFactoringV1(
        {
          idbancocedente: _idbancocedente,
          cantidad_facturas,
          monto_neto,
          dias_pago_estimado,
          porcentaje_adelanto,
          tnm,
        },
        riesgooperacion.porcentaje_comision_gestion,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
  return simulacion;
};
