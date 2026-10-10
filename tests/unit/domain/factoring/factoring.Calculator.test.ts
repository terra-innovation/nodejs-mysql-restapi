import type { FactoringCalculationConfigV3, FactoringCalculationInputV3 } from "#root/src/domain/factoring/factoring.Calculator.js";
import { calculateFactoringPeriod, calculateFactoringV1, calculateFactoringV2, calculateFactoringV3 } from "#root/src/domain/factoring/factoring.Calculator.js";
import { Decimal } from "@prisma/client/runtime/client";
import { DateTime } from "luxon";

const createConfig = (): FactoringCalculationConfigV3 => ({
  constante_igv: { valor: "0.18" },
  constante_costo_cavali_pen: { valor: "10" },
  constante_costo_cavali_usd: { valor: "3" },
  constante_comison_bcp_pen: { valor: "5" },
  constante_comison_bcp_usd: { valor: "1.50" },
  cofigcomision: { factor1: new Decimal("0.01"), factor2: new Decimal(100), factor3: new Decimal(1) },
  financiero_tipo_comision: { idfinancierotipo: 1 },
  financiero_tipo_costo: { idfinancierotipo: 2 },
  financiero_tipo_gasto_excento_igv: { idfinancierotipo: 4 },
  financiero_concepto_comisionft: { idfinancieroconcepto: 1 },
  financiero_concepto_cavali: { idfinancieroconcepto: 2 },
  financiero_concepto_gasto_interbancario: { idfinancieroconcepto: 4 },
});

const createInput = (): FactoringCalculationInputV3 => ({
  idbancocedente: 2,
  cantidad_facturas: 2,
  monto_neto: new Decimal(10000),
  dias_pago_estimado: 30,
  dias_antiguedad_estimado: 31,
  porcentaje_financiado: new Decimal("0.8"),
  tdm: new Decimal("0.02"),
  porcentaje_comision_descuento: new Decimal("0.25"),
  idmoneda: 1,
});

describe("factoring.Calculator sin persistencia", () => {
  it.each([
    [1, 1, "20", "3.6", "0", "7727.01"],
    [1, 2, "20", "3.6", "5", "7722.01"],
    [2, 1, "6", "1.08", "0", "7743.53"],
    [2, 2, "6", "1.08", "1.5", "7742.03"],
  ])("V3: moneda %s y banco %s conservan cargos y adelanto", (idmoneda, idbancocedente, costo, igvCosto, interbancario, adelanto) => {
    const result = calculateFactoringV3({ ...createInput(), idmoneda: Number(idmoneda), idbancocedente: Number(idbancocedente) }, createConfig());

    expect(result.monto_financiado?.toString()).toBe("8000");
    expect(result.monto_garantia?.toString()).toBe("2000");
    expect(result.monto_descuento?.toString()).toBe("160");
    expect(result.monto_comision_bruto?.toString()).toBe("101");
    expect(result.monto_comision?.toString()).toBe("75.75");
    expect(result.monto_comision_igv?.toString()).toBe("13.64");
    expect(result.monto_costo_estimado?.toString()).toBe(costo);
    expect(result.monto_costo_estimado_igv?.toString()).toBe(igvCosto);
    expect(result.monto_gasto_excento_igv?.toString()).toBe(interbancario);
    expect(result.monto_adelanto?.toString()).toBe(adelanto);
    expect(result.gastos_excento_igv).toHaveLength(idbancocedente === 1 ? 0 : 1);
  });

  it("V3: una exoneración total de comisión conserva los costos y gastos bancarios", () => {
    const input = { ...createInput(), porcentaje_comision_descuento: new Decimal(1) };
    const result = calculateFactoringV3(input, createConfig());

    expect(result.monto_comision_bruto?.toString()).toBe("101");
    expect(result.monto_comision?.toString()).toBe("0");
    expect(result.monto_comision_igv?.toString()).toBe("0");
    expect(result.monto_adelanto?.toString()).toBe("7811.4");
  });

  it("V2: el cargo interbancario integra la comisión gravada y CAVALI es un costo único", () => {
    const result = calculateFactoringV2(createInput(), createConfig());

    expect(result.monto_comision?.toString()).toBe("106");
    expect(result.monto_comision_igv?.toString()).toBe("19.08");
    expect(result.monto_costo_estimado?.toString()).toBe("10");
    expect(result.monto_adelanto?.toString()).toBe("7703.12");
    expect(result.gastos_excento_igv).toBeUndefined();
  });

  it("V2 conserva IGV de tres decimales frente a los dos decimales de V3", () => {
    const config = { ...createConfig(), constante_igv: { valor: "0.18765" } };
    expect(calculateFactoringV2(createInput(), config).monto_comision_igv?.toString()).toBe("19.891");
    expect(calculateFactoringV3(createInput(), config).monto_comision_igv?.toString()).toBe("14.21");
  });

  it("V1 conserva porcentajes en escala 0-100 y los mínimos históricos", () => {
    const result = calculateFactoringV1({ idbancocedente: 2, cantidad_facturas: 2, monto_neto: 10000, dias_pago_estimado: 30, porcentaje_adelanto: 80, tnm: 2 }, new Decimal("1.25"));

    expect(result.monto_adelanto).toBe(8000);
    expect(result.monto_comision_uso_sitio_estimado).toBe(130);
    expect(result.monto_comision_gestion).toBe(100);
    expect(result.monto_comision_interbancaria).toBe(4.8);
    expect(result.monto_igv).toBe(65.5);
    expect(result.monto_costo_financiamiento_estimado).toBe(160.01);
    expect(result.monto_desembolso).toBeCloseTo(7410.61, 2);
  });

  it("calcula días por inicio de día y conserva los instantes de las fechas", () => {
    const ahora = DateTime.fromISO("2026-09-01T23:30:00", { zone: "America/Lima" });
    const fin = DateTime.fromISO("2026-10-01T08:00:00", { zone: "America/Lima" });
    const emision = DateTime.fromISO("2026-08-01T12:00:00", { zone: "America/Lima" });
    const result = calculateFactoringPeriod(ahora, fin, emision);

    expect(result.dias_pago_estimado).toBe(30);
    expect(result.dias_antiguedad_estimado).toBe(31);
    expect(result.fecha_pago_estimado).toEqual(fin.toJSDate());
    expect(result.fecha_simulacion).toEqual(ahora.toJSDate());
    expect(result.fecha_propuesta).toEqual(ahora.toJSDate());
  });

  it("repite el cálculo sin modificar parámetros ni configuración", () => {
    const input = createInput();
    const config = createConfig();
    const before = JSON.stringify({ input, config });
    const first = calculateFactoringV3(input, config);
    const second = calculateFactoringV3(input, config);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(JSON.stringify({ input, config })).toBe(before);
  });
});
