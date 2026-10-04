import type { Comision, Costo, Gasto_excento_igv, Simulacion } from "#root/src/types/Simulacion.types.js";
import { Decimal } from "@prisma/client/runtime/library";
import type { DateTime } from "luxon";

/** Datos necesarios para calcular; no contiene acceso a persistencia. */
export interface FactoringCalculationInput {
  idbancocedente: number;
  cantidad_facturas: number;
  monto_neto: Decimal;
  dias_pago_estimado: number;
  porcentaje_financiado: Decimal;
  tdm: Decimal;
  dias_antiguedad_estimado: number;
}

export interface FactoringCalculationInputV3 extends FactoringCalculationInput {
  porcentaje_comision_descuento: Decimal;
  idmoneda: number;
}

export interface FactoringCalculationConfig {
  constante_igv: { valor: Decimal.Value };
  constante_costo_cavali_pen: { valor: Decimal.Value };
  constante_comison_bcp_pen: { valor: Decimal.Value };
  cofigcomision: { factor1: Decimal; factor2: Decimal; factor3: Decimal };
  financiero_tipo_comision: Comision["financiero_tipo"];
  financiero_tipo_costo: Costo["financiero_tipo"];
  financiero_concepto_comisionft: Comision["financiero_concepto"];
  financiero_concepto_cavali: Costo["financiero_concepto"];
}

export interface FactoringCalculationConfigV3 extends FactoringCalculationConfig {
  constante_costo_cavali_usd: { valor: Decimal.Value };
  constante_comison_bcp_usd: { valor: Decimal.Value };
  financiero_tipo_gasto_excento_igv: Gasto_excento_igv["financiero_tipo"];
  financiero_concepto_gasto_interbancario: Gasto_excento_igv["financiero_concepto"];
}

export const calculateFactoringPeriod = (fecha_ahora: DateTime, fecha_fin: DateTime, fecha_emision: DateTime) => ({
  dias_pago_estimado: Math.floor(fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days),
  dias_antiguedad_estimado: Math.floor(fecha_ahora.startOf("day").diff(fecha_emision.startOf("day"), "days").days),
  fecha_pago_estimado: fecha_fin.toJSDate(),
  fecha_propuesta: fecha_ahora.toJSDate(),
  fecha_simulacion: fecha_ahora.toJSDate(),
});

/** Conserva las reglas y redondeos de la versión 3. */
export const calculateFactoringV3 = (input: FactoringCalculationInputV3, config: FactoringCalculationConfigV3): Partial<Simulacion> => {
  const { idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_financiado, tdm, dias_antiguedad_estimado, porcentaje_comision_descuento, idmoneda } = input;
  const { constante_igv, constante_costo_cavali_pen, constante_comison_bcp_pen, cofigcomision, financiero_tipo_comision, financiero_tipo_costo, financiero_concepto_comisionft, financiero_concepto_cavali, constante_costo_cavali_usd, constante_comison_bcp_usd, financiero_tipo_gasto_excento_igv, financiero_concepto_gasto_interbancario } = config;
  const simulacion: Partial<Simulacion> = {};

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

  const comisiones = [];

  const comisionft_porcentaje = cofigcomision.factor1
    .mul(Decimal.exp(cofigcomision.factor2.div(simulacion.monto_neto)))
    .mul(cofigcomision.factor3)
    .toDecimalPlaces(5);

  let monto_comision_bruto = comisionft_porcentaje.mul(simulacion.monto_neto).toDecimalPlaces(2);

  let comisionft_monto = monto_comision_bruto.mul(new Decimal(1).minus(porcentaje_comision_descuento)).toDecimalPlaces(2);

  let comisionft_igv = comisionft_monto.mul(constante_igv.valor).toDecimalPlaces(2);

  let comision_ft: Partial<Comision> = {
    idfinancierotipo: financiero_tipo_comision.idfinancierotipo,
    idfinancieroconcepto: financiero_concepto_comisionft.idfinancieroconcepto,
    cantidad: new Decimal(1),
    monto_unitario: comisionft_monto,
    monto: comisionft_monto,
    igv: comisionft_igv,
    financiero_tipo: financiero_tipo_comision,
    financiero_concepto: financiero_concepto_comisionft,
  };
  comision_ft.total = comision_ft.monto.add(comision_ft.igv).toDecimalPlaces(2);
  comision_ft.porcentaje_monto = comision_ft.monto.div(simulacion.monto_neto).toDecimalPlaces(5);
  comisiones.push(comision_ft);

  simulacion.comisiones = comisiones;

  const costos = [];
  const cavali_monto = idmoneda == 1 ? new Decimal(constante_costo_cavali_pen.valor) : new Decimal(constante_costo_cavali_usd.valor);
  const cavali_monto_total = cavali_monto.mul(cantidad_facturas);
  let costo_cavali: Partial<Costo> = {
    idfinancierotipo: financiero_tipo_costo.idfinancierotipo,
    idfinancieroconcepto: financiero_concepto_cavali.idfinancieroconcepto,
    cantidad: new Decimal(cantidad_facturas),
    monto_unitario: cavali_monto,
    monto: cavali_monto_total,
    igv: cavali_monto_total.mul(new Decimal(constante_igv.valor)).toDecimalPlaces(2),
    financiero_tipo: financiero_tipo_costo,
    financiero_concepto: financiero_concepto_cavali,
    total: new Decimal(0),
  };

  costo_cavali.total = costo_cavali.monto.add(costo_cavali.igv).toDecimalPlaces(2);
  costo_cavali.porcentaje_monto = costo_cavali.monto.div(simulacion.monto_neto).toDecimalPlaces(5);
  costos.push(costo_cavali);

  simulacion.costos = costos;

  const gastos = [];

  simulacion.gastos = gastos;

  const gastos_excento_igv = [];

  const gasto_interbantario_monto = new Decimal(idmoneda == 1 ? constante_comison_bcp_pen.valor : constante_comison_bcp_usd.valor);
  if (idbancocedente != 1) {
    let gasto_interbancario: Partial<Gasto_excento_igv> = {
      idfinancierotipo: financiero_tipo_gasto_excento_igv.idfinancierotipo,
      idfinancieroconcepto: financiero_concepto_gasto_interbancario.idfinancieroconcepto,
      cantidad: new Decimal(1),
      monto_unitario: gasto_interbantario_monto,
      monto: gasto_interbantario_monto,
      igv: new Decimal(0),
      financiero_tipo: financiero_tipo_gasto_excento_igv,
      financiero_concepto: financiero_concepto_gasto_interbancario,
      total: new Decimal(0),
    };
    gasto_interbancario.total = gasto_interbancario.monto.add(gasto_interbancario.igv).toDecimalPlaces(2);
    gasto_interbancario.porcentaje_monto = gasto_interbancario.monto.div(simulacion.monto_neto).toDecimalPlaces(5);
    gastos_excento_igv.push(gasto_interbancario);
  }

  simulacion.gastos_excento_igv = gastos_excento_igv;

  simulacion.monto_comision_bruto = monto_comision_bruto;

  simulacion.monto_comision = comisiones.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_comision_igv = comisiones.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_costo_estimado = costos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_costo_estimado_igv = costos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_gasto_estimado = gastos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_gasto_estimado_igv = gastos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_total_igv = simulacion.monto_comision_igv.add(simulacion.monto_costo_estimado_igv).add(simulacion.monto_gasto_estimado_igv).toDecimalPlaces(2);

  simulacion.monto_gasto_excento_igv = gastos_excento_igv.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_adelanto = simulacion.monto_financiado.minus(simulacion.monto_descuento).minus(simulacion.monto_comision).minus(simulacion.monto_costo_estimado).minus(simulacion.monto_gasto_estimado).minus(simulacion.monto_total_igv).minus(simulacion.monto_gasto_excento_igv).toDecimalPlaces(2);

  simulacion.monto_dia_mora_estimado = new Decimal(0);

  simulacion.monto_dia_interes_estimado = simulacion.monto_financiado.mul(new Decimal(1).add(simulacion.tdd).pow(1).minus(1)).toDecimalPlaces(2);

  simulacion.porcentaje_comision_descuento = porcentaje_comision_descuento.toDecimalPlaces(5);

  simulacion.porcentaje_garantia_estimado = simulacion.monto_garantia.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_efectivo_estimado = simulacion.monto_efectivo.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_financiado_estimado = simulacion.monto_financiado.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_descuento_estimado = simulacion.monto_descuento.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_adelanto_estimado = simulacion.monto_adelanto.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_comision_estimado = simulacion.monto_comision.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.dias_cobertura_garantia_estimado = Decimal.ln(simulacion.monto_financiado.add(simulacion.monto_garantia).div(simulacion.monto_financiado))
    .div(Decimal.ln(simulacion.tdm.add(1)))
    .mul(30)
    .floor()
    .toNumber();

  return simulacion;
};

/** Conserva las reglas y redondeos de la version 2. */
export const calculateFactoringV2 = (input: FactoringCalculationInput, config: FactoringCalculationConfig): Partial<Simulacion> => {
  const { idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_financiado, tdm, dias_antiguedad_estimado } = input;
  const { constante_igv, constante_costo_cavali_pen, constante_comison_bcp_pen, cofigcomision, financiero_tipo_comision, financiero_tipo_costo, financiero_concepto_comisionft, financiero_concepto_cavali } = config;
  const simulacion: Partial<Simulacion> = {};

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

  const comisiones = [];

  const comisionft_porcentaje = cofigcomision.factor1
    .mul(Decimal.exp(cofigcomision.factor2.div(simulacion.monto_neto)))
    .mul(cofigcomision.factor3)
    .toDecimalPlaces(5);

  let comisionft_monto = comisionft_porcentaje.mul(simulacion.monto_neto).toDecimalPlaces(2);

  comisionft_monto = comisionft_monto.add(idbancocedente == 1 ? new Decimal(0) : constante_comison_bcp_pen.valor);

  let comisionft_igv = comisionft_monto.mul(constante_igv.valor).toDecimalPlaces(3);

  let comision_ft: Partial<Comision> = {
    idfinancierotipo: financiero_tipo_comision.idfinancierotipo,
    idfinancieroconcepto: financiero_concepto_comisionft.idfinancieroconcepto,
    monto: comisionft_monto,
    igv: comisionft_igv,
    financiero_tipo: financiero_tipo_comision,
    financiero_concepto: financiero_concepto_comisionft,
  };
  comision_ft.total = comision_ft.monto.add(comision_ft.igv).toDecimalPlaces(2);
  comisiones.push(comision_ft);

  simulacion.comisiones = comisiones;

  const costos = [];
  let costo_cavali: Partial<Costo> = {
    idfinancierotipo: financiero_tipo_costo.idfinancierotipo,
    idfinancieroconcepto: financiero_concepto_cavali.idfinancieroconcepto,
    monto: new Decimal(constante_costo_cavali_pen.valor),
    igv: new Decimal(constante_costo_cavali_pen.valor).mul(new Decimal(constante_igv.valor)).toDecimalPlaces(3),
    financiero_tipo: financiero_tipo_costo,
    financiero_concepto: financiero_concepto_cavali,
    total: new Decimal(0),
  };
  costo_cavali.total = costo_cavali.monto.add(costo_cavali.igv).toDecimalPlaces(2);
  costos.push(costo_cavali);

  simulacion.costos = costos;

  const gastos = [];

  simulacion.gastos = gastos;

  simulacion.monto_comision = comisiones.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_comision_igv = comisiones.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_costo_estimado = costos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_costo_estimado_igv = costos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_gasto_estimado = gastos.reduce((acc, item) => acc.add(new Decimal(item.monto)), new Decimal(0));

  simulacion.monto_gasto_estimado_igv = gastos.reduce((acc, item) => acc.add(new Decimal(item.igv)), new Decimal(0));

  simulacion.monto_total_igv = simulacion.monto_comision_igv.add(simulacion.monto_costo_estimado_igv).add(simulacion.monto_gasto_estimado_igv).toDecimalPlaces(2);

  simulacion.monto_adelanto = simulacion.monto_financiado.minus(simulacion.monto_descuento).minus(simulacion.monto_comision).minus(simulacion.monto_costo_estimado).minus(simulacion.monto_gasto_estimado).minus(simulacion.monto_total_igv).toDecimalPlaces(2);

  simulacion.monto_dia_mora_estimado = new Decimal(0);

  simulacion.monto_dia_interes_estimado = simulacion.monto_financiado.mul(new Decimal(1).add(simulacion.tdd).pow(1).minus(1)).toDecimalPlaces(2);

  simulacion.porcentaje_garantia_estimado = simulacion.monto_garantia.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_efectivo_estimado = simulacion.monto_efectivo.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_financiado_estimado = simulacion.monto_financiado.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_descuento_estimado = simulacion.monto_descuento.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_adelanto_estimado = simulacion.monto_adelanto.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.porcentaje_comision_estimado = simulacion.monto_comision.div(simulacion.monto_neto).toDecimalPlaces(5);

  simulacion.dias_cobertura_garantia_estimado = Decimal.ln(simulacion.monto_financiado.add(simulacion.monto_garantia).div(simulacion.monto_financiado))
    .div(Decimal.ln(simulacion.tdm.add(1)))
    .mul(30)
    .floor()
    .toNumber();

  return simulacion;
};

export interface FactoringCalculationInputV1 {
  idbancocedente: number;
  cantidad_facturas: number;
  monto_neto: number;
  dias_pago_estimado: number;
  porcentaje_adelanto: number;
  tnm: number;
}

/** Versión histórica: porcentajes en escala 0-100 y cálculos con number. */
export const calculateFactoringV1 = (input: FactoringCalculationInputV1, porcentaje_comision_gestion: Decimal.Value): Record<string, any> => {
  const { idbancocedente: _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_adelanto, tnm } = input;
  const simulacion: Record<string, any> = {};
  simulacion.dias_pago_estimado = dias_pago_estimado;
  simulacion.montoCostoCAVALI = 4.54;
  simulacion.montoComisionOperacionPorFactura = 10;
  simulacion.montoCostoEstudioPorAceptante = 100;
  simulacion.porcentajeComisionUsoSitio = 0.7;
  simulacion.minimoComisionUsoSitio = 130;
  simulacion.minimoComisionGestion = 20;
  simulacion.porcentajeComisionGestion = porcentaje_comision_gestion;
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

  return simulacion;
};
