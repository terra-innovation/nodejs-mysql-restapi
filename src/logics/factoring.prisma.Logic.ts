import { Prisma, factoring_propuesta_financiero } from "#src/models/prisma/ft_factoring/client";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as configuracionappDao from "#src/daos/configuracionapp.prisma.Dao.js";
import * as factoringconfigcomisionDao from "#src/daos/factoringconfigcomision.prisma.Dao.js";
import * as financieroconceptoDao from "#src/daos/financieroconcepto.prisma.Dao.js";
import * as financierotipoDao from "#src/daos/financierotipo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { ConfiguracionAppCreationAttributes } from "#src/models/ft_factoring/ConfiguracionApp.js";
import { Simulacion, Costo, Comision } from "#src/types/Simulacion.prisma.types.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import { line, log } from "#root/src/utils/logger.pino.js";
import { Decimal } from "@prisma/client/runtime/library";

export const simulateFactoringLogicV2 = async (
  idriesgooperacion: number,
  idbancocedente: number,
  cantidad_facturas: number,
  monto_neto: Prisma.Decimal,
  dias_pago_estimado: number,
  porcentaje_financiado: Prisma.Decimal,
  tdm: Prisma.Decimal,
  dias_antiguedad_estimado: number
): Promise<Partial<Simulacion>> => {
  log.debug(line(), "logic::simulateFactoringLogicV2");

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      var simulacion: Partial<Simulacion> = {};

      var constante_igv = await configuracionappDao.getIGV(tx);
      var constante_costo_cavali = await configuracionappDao.getCostoCAVALI(tx);
      var constante_comison_bcp = await configuracionappDao.getComisionBCP(tx);

      var riesgooperacion = await riesgoDao.getRiesgoByIdriesgo(tx, idriesgooperacion);
      var cofigcomision = await factoringconfigcomisionDao.getFactoringconfigcomisionByIdriesgo(tx, riesgooperacion.idriesgo, [1]);
      var financiero_tipo_comision = await financierotipoDao.getComision(tx);
      const financiero_tipo_costo = await financierotipoDao.getCosto(tx);
      var financiero_tipo_gasto = await financierotipoDao.getGasto(tx);

      var financiero_concepto_comisionft = await financieroconceptoDao.getComisionFinanzaTech(tx);
      var financiero_concepto_cavali = await financieroconceptoDao.getCostoCAVALI(tx);
      var financiero_concepto_transaccion = await financieroconceptoDao.getCostoTransaccion(tx);

      simulacion.dias_pago_estimado = dias_pago_estimado;
      simulacion.dias_antiguedad_estimado = dias_antiguedad_estimado;
      simulacion.tda = new Decimal(1).add(tdm).pow(12).minus(1).toDecimalPlaces(10);
      simulacion.tdm = tdm.toDecimalPlaces(5);
      simulacion.tdd = new Decimal(1).add(tdm).pow(new Decimal(1).div(30)).minus(1).toDecimalPlaces(10);
      simulacion.tdm_mora = new Decimal(0);
      simulacion.tda_mora = new Decimal(0);
      simulacion.tdd_mora = new Decimal(0);
      simulacion.monto_neto = monto_neto;
      simulacion.monto_garantia = monto_neto.mul(new Decimal(1).minus(porcentaje_financiado)).toDecimalPlaces(2);
      simulacion.monto_efectivo = monto_neto.mul(porcentaje_financiado).toDecimalPlaces(2);
      simulacion.monto_financiado = simulacion.monto_efectivo;
      simulacion.monto_descuento = simulacion.monto_financiado.mul(new Decimal(1).add(simulacion.tdd!).pow(simulacion.dias_pago_estimado).minus(1)).toDecimalPlaces(2);

      var comisiones = [];

      const comisionft_porcentaje = cofigcomision.factor1
        .mul(Decimal.exp(cofigcomision.factor2.div(simulacion.monto_neto)))
        .mul(cofigcomision.factor3)
        .toDecimalPlaces(5);

      //let comisionft_monto = Number((comisionft_porcentaje * simulacion.monto_neto).toFixed(2));
      let comisionft_monto = comisionft_porcentaje.mul(simulacion.monto_neto).toDecimalPlaces(2);

      //comisionft_monto = comisionft_monto + Number(idbancocedente == 1 ? 0 : constante_comison_bcp.valor);
      comisionft_monto = comisionft_monto.add(idbancocedente == 1 ? new Decimal(0) : constante_comison_bcp.valor);

      //let comisionft_igv = Number((comisionft_monto * Number(constante_igv.valor)).toFixed(3));
      let comisionft_igv = comisionft_monto.mul(constante_igv.valor).toDecimalPlaces(3);

      let comision_ft: Partial<Comision> = {
        comisionft_porcentaje: comisionft_porcentaje,
        idfinancierotipo: financiero_tipo_comision.idfinancierotipo,
        idfinancieroconcepto: financiero_concepto_comisionft.idfinancieroconcepto,
        monto: comisionft_monto,
        igv: comisionft_igv,
        financierotipo: financiero_tipo_comision,
        financieroconcepto: financiero_concepto_comisionft,
      };
      //comision_ft.total = Number((comision_ft.monto + comision_ft.igv).toFixed(2));
      comision_ft.total = comision_ft.monto.add(comision_ft.igv).toDecimalPlaces(2);
      comisiones.push(comision_ft);

      simulacion.comisiones = comisiones;

      var costos = [];
      let costo_cavali: Partial<Costo> = {
        idfinancierotipo: financiero_tipo_costo.idfinancierotipo,
        idfinancieroconcepto: financiero_concepto_cavali.idfinancieroconcepto,
        monto: new Decimal(constante_costo_cavali.valor),
        //igv: Number((Number(constante_costo_cavali.valor) * Number(constante_igv.valor)).toFixed(3)),
        igv: new Decimal(constante_costo_cavali.valor).mul(new Decimal(constante_igv.valor)).toDecimalPlaces(3),
        //financierotipo: financiero_tipo_costo,
        financieroconcepto: financiero_concepto_cavali,
        total: new Decimal(0),
      };
      //costo_cavali.total = Number((costo_cavali.monto * 1 + costo_cavali.igv * 1).toFixed(2));
      costo_cavali.total = costo_cavali.monto.mul(costo_cavali.igv).toDecimalPlaces(2);
      costos.push(costo_cavali);

      simulacion.costos = costos;

      var gastos = [];

      simulacion.gastos = gastos;

      //simulacion.monto_comision = comisiones.reduce((acumulador, item) => {
      //  return acumulador + item.monto;
      //}, 0);
      simulacion.monto_comision = comisiones.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

      //simulacion.monto_comision_igv = comisiones.reduce((acumulador, item) => {
      //  return acumulador + item.igv;
      //}, 0);
      simulacion.monto_comision_igv = comisiones.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

      //simulacion.monto_costo_estimado = costos.reduce((acumulador, item) => {
      //  return acumulador + item.monto;
      //}, 0);
      simulacion.monto_costo_estimado = costos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

      //simulacion.monto_costo_estimado_igv = costos.reduce((acumulador, item) => {
      //  return acumulador + item.igv;
      //}, 0);
      simulacion.monto_costo_estimado_igv = costos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

      //simulacion.monto_gasto_estimado = gastos.reduce((acumulador, item) => {
      //  return acumulador + item.monto;
      //}, 0);
      simulacion.monto_gasto_estimado = gastos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

      //simulacion.monto_gasto_estimado_igv = gastos.reduce((acumulador, item) => {
      //  return acumulador + item.igv;
      //}, 0);
      simulacion.monto_gasto_estimado_igv = gastos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

      //simulacion.monto_total_igv = Number((simulacion.monto_comision_igv + simulacion.monto_costo_estimado_igv + simulacion.monto_gasto_estimado_igv).toFixed(2));
      simulacion.monto_total_igv = simulacion.monto_comision_igv.add(simulacion.monto_costo_estimado_igv).add(simulacion.monto_gasto_estimado_igv).toDecimalPlaces(2);

      //simulacion.monto_adelanto = Number((simulacion.monto_financiado - simulacion.monto_descuento - simulacion.monto_comision - simulacion.monto_costo_estimado - simulacion.monto_gasto_estimado - simulacion.monto_total_igv).toFixed(2));
      simulacion.monto_adelanto = simulacion.monto_financiado.minus(simulacion.monto_descuento).minus(simulacion.monto_comision).minus(simulacion.monto_costo_estimado).minus(simulacion.monto_gasto_estimado).minus(simulacion.monto_total_igv).toDecimalPlaces(2);

      //simulacion.monto_dia_mora_estimado = 0;
      simulacion.monto_dia_mora_estimado = new Decimal(0);

      //simulacion.monto_dia_interes_estimado = Number((simulacion.monto_financiado * (Math.pow(1 + simulacion.tdd, 1) - 1)).toFixed(2));
      simulacion.monto_dia_interes_estimado = simulacion.monto_financiado.mul(new Decimal(1).add(simulacion.tdd).pow(1).minus(1)).toDecimalPlaces(2);

      //simulacion.porcentaje_garantia_estimado = Number((simulacion.monto_garantia / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_garantia_estimado = simulacion.monto_garantia.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.porcentaje_efectivo_estimado = Number((simulacion.monto_efectivo / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_efectivo_estimado = simulacion.monto_efectivo.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.porcentaje_financiado_estimado = Number((simulacion.monto_financiado / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_financiado_estimado = simulacion.monto_financiado.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.porcentaje_descuento_estimado = Number((simulacion.monto_descuento / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_descuento_estimado = simulacion.monto_descuento.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.porcentaje_adelanto_estimado = Number((simulacion.monto_adelanto / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_adelanto_estimado = simulacion.monto_adelanto.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.porcentaje_comision_estimado = Number((simulacion.monto_comision / simulacion.monto_neto).toFixed(5));
      simulacion.porcentaje_comision_estimado = simulacion.monto_comision.div(simulacion.monto_neto).toDecimalPlaces(5);

      //simulacion.dias_cobertura_garantia_estimado = Math.floor((Math.log((simulacion.monto_financiado + simulacion.monto_garantia) / simulacion.monto_financiado) / Math.log(1 + simulacion.tdm)) * 30);
      simulacion.dias_cobertura_garantia_estimado = Decimal.ln(simulacion.monto_financiado.add(simulacion.monto_garantia).div(simulacion.monto_financiado))
        .div(Decimal.ln(simulacion.tdm.add(1)))
        .mul(30)
        .floor()
        .toNumber();

      //log.debug(line(), "simulacion: ", simulacion);

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  return simulacion;
};

export const simulateFactoringLogicV1 = async (_idriesgooperacion, _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_adelanto, tnm) => {
  log.debug(line(), "logic::simulateFactoringLogicV1");

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      var simulacion: Record<string, any> = {};
      simulacion.dias_pago_estimado = dias_pago_estimado;
      simulacion.montoCostoCAVALI = 4.54;
      simulacion.montoComisionOperacionPorFactura = 10;
      simulacion.montoCostoEstudioPorAceptante = 100;
      simulacion.porcentajeComisionUsoSitio = 0.7;
      simulacion.minimoComisionUsoSitio = 130;
      simulacion.minimoComisionGestion = 20;
      simulacion.porcentajeComisionGestion = (await riesgoDao.getRiesgoByIdriesgo(tx, _idriesgooperacion)).porcentaje_comision_gestion;
      simulacion.cantidadMeses = Math.ceil(simulacion.dias_pago_estimado / 30);
      simulacion.montoComisionInterbancariaInmediataBCP = 4.8;
      simulacion.porcentajeIGV = 18;
      simulacion.tna = Number((tnm * 12).toFixed(5));
      simulacion.tnd = Number((tnm / 30).toFixed(5));
      simulacion.tea = Number(((Math.pow(1 + simulacion.tna / 100 / 360, 360) - 1) * 100).toFixed(5));
      simulacion.tem = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 12) - 1) * 100).toFixed(5));
      simulacion.ted = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 360) - 1) * 100).toFixed(5));
      simulacion.tnm_mora = 0.5;
      simulacion.tna_mora = Number((simulacion.tnm_mora * 12).toFixed(5));
      simulacion.tnd_mora = Number((simulacion.tna_mora / 360).toFixed(5));
      simulacion.monto_adelanto = Number(((monto_neto * porcentaje_adelanto) / 100).toFixed(2));
      simulacion.monto_garantia = Number((monto_neto - simulacion.monto_adelanto).toFixed(2));
      simulacion.monto_costo_financiamiento_estimado = Number((simulacion.monto_adelanto * (simulacion.tnd / 100) * simulacion.dias_pago_estimado).toFixed(2));
      simulacion.monto_comision_operacion = Number((simulacion.montoComisionOperacionPorFactura * cantidad_facturas).toFixed(2));
      simulacion.monto_costo_estudio = simulacion.montoCostoEstudioPorAceptante;
      simulacion.monto_comision_uso_sitio_estimado = Math.max(simulacion.monto_adelanto * simulacion.cantidadMeses * (simulacion.porcentajeComisionUsoSitio / 100), simulacion.minimoComisionUsoSitio);

      simulacion.monto_comision_gestion = simulacion.monto_adelanto * (simulacion.porcentajeComisionGestion / 100);
      simulacion.monto_comision_interbancaria = _idbancocedente == 1 ? 0 : simulacion.montoComisionInterbancariaInmediataBCP;
      simulacion.monto_costo_cavali = simulacion.montoCostoCAVALI * cantidad_facturas;

      simulacion.monto_comision_factor = simulacion.monto_comision_operacion + simulacion.monto_costo_estudio + simulacion.monto_comision_uso_sitio_estimado + simulacion.monto_comision_gestion + simulacion.monto_comision_interbancaria + simulacion.monto_costo_cavali;

      simulacion.monto_igv = Number((simulacion.monto_comision_factor * (simulacion.porcentajeIGV / 100)).toFixed(2));

      simulacion.monto_costo_factoring = simulacion.monto_comision_factor + simulacion.monto_costo_financiamiento_estimado;
      simulacion.monto_desembolso = simulacion.monto_adelanto - simulacion.monto_costo_factoring - simulacion.monto_igv;

      simulacion.porcentaje_desembolso = (simulacion.monto_desembolso / simulacion.monto_adelanto) * 100;
      simulacion.porcentaje_comision_factor = (simulacion.monto_comision_factor / simulacion.monto_adelanto) * 100;
      simulacion.porcentaje_costo_factoring = (simulacion.monto_costo_factoring / simulacion.monto_adelanto) * 100;

      simulacion.monto_dia_interes = (simulacion.tnd / 100) * simulacion.monto_adelanto;
      simulacion.monto_dia_mora = (simulacion.tnd_mora / 100) * simulacion.monto_adelanto;
      simulacion.dias_cobertura_garantia = simulacion.monto_garantia / (simulacion.monto_dia_interes + simulacion.monto_dia_mora);

      simulacion.tcnm = (simulacion.monto_costo_factoring / simulacion.monto_adelanto / simulacion.dias_pago_estimado) * 30 * 100;
      simulacion.tcna = simulacion.tcnm * 12;
      simulacion.tcnd = simulacion.tcnm / 30;

      //log.debug(line(), "simulacion: ", simulacion);

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  return simulacion;
};
