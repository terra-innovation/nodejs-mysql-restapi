import { describe, expect, it } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateFactoringV2, calculateFactoringV3 } from "#root/src/domain/factoring/factoring.Calculator.js";
import type { FactoringCalculationConfigV3, FactoringCalculationInputV3 } from "#root/src/domain/factoring/factoring.Calculator.js";

const config: FactoringCalculationConfigV3 = {
  constante_igv: { valor: "0.18" },
  constante_costo_cavali_pen: { valor: "10" },
  constante_costo_cavali_usd: { valor: "3" },
  constante_comison_bcp_pen: { valor: "5" },
  constante_comison_bcp_usd: { valor: "1.50" },
  cofigcomision: { factor1: new Decimal("0.01"), factor2: new Decimal(0), factor3: new Decimal(1) },
  financiero_tipo_comision: { idfinancierotipo: 1 },
  financiero_tipo_costo: { idfinancierotipo: 2 },
  financiero_tipo_gasto_excento_igv: { idfinancierotipo: 4 },
  financiero_concepto_comisionft: { idfinancieroconcepto: 1 },
  financiero_concepto_cavali: { idfinancieroconcepto: 2 },
  financiero_concepto_gasto_interbancario: { idfinancieroconcepto: 4 },
};

describe("DT-LIQ-04: garantía como residual del financiamiento", () => {
  for (const calcular of [calculateFactoringV2, calculateFactoringV3]) {
    it.each([
      ["100.01", "0", "0", "100.01"],
      ["100.01", "0.5", "50.01", "50"],
      ["100.01", "0.8", "80.01", "20"],
      ["100.01", "1", "100.01", "0"],
      ["99999999.99", "0.5", "50000000", "49999999.99"],
    ])(`${calcular.name}: neto %s, porcentaje %s conserva capital`, (neto, porcentaje, financiado, garantia) => {
      const result = calcular({ idmoneda: 1, idbancocedente: 1, cantidad_facturas: 1, monto_neto: new Decimal(neto), porcentaje_financiado: new Decimal(porcentaje), tdm: new Decimal(0), porcentaje_comision_descuento: new Decimal(0), dias_pago_estimado: 30, dias_antiguedad_estimado: 30 }, config);
      expect(result.monto_financiado?.toString()).toBe(financiado);
      expect(result.monto_garantia?.toString()).toBe(garantia);
      expect(result.monto_financiado!.plus(result.monto_garantia!).toString()).toBe(neto);
      expect(result.monto_garantia!.isNegative()).toBe(false);
    });
  }
});

describe("DT-LIQ-05: cobertura con tasa cero", () => {
  for (const calcular of [calculateFactoringV2, calculateFactoringV3]) {
    it.each(["0", "0.8", "1"])(`${calcular.name}: tasa cero y financiamiento %s devuelven null sin alterar descuento`, (porcentaje) => {
      const result = calcular({ idmoneda: 1, idbancocedente: 1, cantidad_facturas: 2, monto_neto: new Decimal(20000), porcentaje_financiado: new Decimal(porcentaje), tdm: new Decimal(0), porcentaje_comision_descuento: new Decimal(0), dias_pago_estimado: 30, dias_antiguedad_estimado: 30 }, config);
      expect(result.dias_cobertura_garantia_estimado).toBeNull();
      expect(result.monto_descuento?.toString()).toBe("0");
      expect(result.monto_dia_interes_estimado?.toString()).toBe("0");
      expect(JSON.parse(JSON.stringify(result)).dias_cobertura_garantia_estimado).toBeNull();
    });
    it.each([["0.8", 338], ["1", 0]] as const)(`${calcular.name}: conserva cobertura de tasa positiva para financiamiento %s`, (porcentaje, dias) => {
      const result = calcular({ idmoneda: 1, idbancocedente: 1, cantidad_facturas: 2, monto_neto: new Decimal(20000), porcentaje_financiado: new Decimal(porcentaje), tdm: new Decimal("0.02"), porcentaje_comision_descuento: new Decimal(0), dias_pago_estimado: 30, dias_antiguedad_estimado: 30 }, config);
      expect(result.dias_cobertura_garantia_estimado).toBe(dias);
    });
  }
});

describe("Factoring V3: desembolso sin días de interés", () => {
  // Valores independientes: 12 000 x 75% = 9 000; comisión 120 x 75% = 90;
  // IGV comisión = 16.20; tres facturas CAVALI = 30 PEN / 9 USD.
  it.each([
    { moneda: 1, banco: 1, costo: "30", igvCosto: "5.4", gasto: "0", adelanto: "8858.4" },
    { moneda: 1, banco: 2, costo: "30", igvCosto: "5.4", gasto: "5", adelanto: "8853.4" },
    { moneda: 2, banco: 1, costo: "9", igvCosto: "1.62", gasto: "0", adelanto: "8883.18" },
    { moneda: 2, banco: 2, costo: "9", igvCosto: "1.62", gasto: "1.5", adelanto: "8881.68" },
  ])("moneda $moneda y banco $banco conservan cargos y redondeos", ({ moneda, banco, costo, igvCosto, gasto, adelanto }) => {
    const input: FactoringCalculationInputV3 = {
      idmoneda: moneda,
      idbancocedente: banco,
      cantidad_facturas: 3,
      monto_neto: new Decimal("12000"),
      porcentaje_financiado: new Decimal("0.75"),
      tdm: new Decimal("0.02"),
      porcentaje_comision_descuento: new Decimal("0.25"),
      dias_pago_estimado: 0,
      dias_antiguedad_estimado: 30,
    };
    const result = calculateFactoringV3(input, config);

    expect(result.monto_financiado?.toString()).toBe("9000");
    expect(result.monto_garantia?.toString()).toBe("3000");
    expect(result.monto_descuento?.toString()).toBe("0");
    expect(result.monto_comision_bruto?.toString()).toBe("120");
    expect(result.monto_comision?.toString()).toBe("90");
    expect(result.monto_comision_igv?.toString()).toBe("16.2");
    expect(result.monto_costo_estimado?.toString()).toBe(costo);
    expect(result.monto_costo_estimado_igv?.toString()).toBe(igvCosto);
    expect(result.monto_gasto_excento_igv?.toString()).toBe(gasto);
    expect(result.monto_adelanto?.toString()).toBe(adelanto);
    expect(result.comisiones?.[0].total.toString()).toBe("106.2");
    expect(result.costos?.[0].cantidad.toString()).toBe("3");
    expect(result.gastos_excento_igv).toHaveLength(banco === 1 ? 0 : 1);
  });
});
