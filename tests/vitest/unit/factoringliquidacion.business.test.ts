import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import { boundary as b, ids, liquidationDto, proposalDto, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { createFactoringliquidacionService, simulateFactoringliquidacionService, updateFactoringliquidacionService } from "#src/services/admin/factoringliquidacion.Service.js";
import { createFactoringpropuestaService } from "#src/services/admin/factoringpropuesta.Service.js";

beforeEach(() => { resetFactoringBoundary(); });
afterEach(() => { vi.useRealTimers(); });

describe("Liquidación con calculador real y valores independientes", () => {
  // 16 000 financiados, 4 000 de garantía; 30 días = 320, 60 días = 646.40.
  // Mora: 326.40 + 18% de IGV (58.75) = 385.15. Reintegro día de inicio: 320.
  for (const moneda of [1, 2]) for (const banco of [1, 2]) {
    const fee = banco === 1 ? "0" : moneda === 1 ? "7.5" : "2.5";
    it.each([
      ["inicio", "2026-09-01T05:00:00Z", 0, 0, "0", "320", "0", "4320"],
      ["puntual", "2026-10-01T05:00:00Z", 30, 0, "320", "0", "0", "4000"],
      ["tardío", "2026-10-31T05:00:00Z", 60, 30, "646.4", "0", "326.4", "3614.85"],
    ] as const)(`moneda ${moneda} banco ${banco}, pago %s`, async (_label, pago, dias, mora, descuento, reintegro, cargo, saldo) => {
      resetFactoringBoundary(moneda, banco);
      const result = await simulateFactoringliquidacionService({ ...liquidationDto(), fecha_pago_efectivo: pago });
      expect(result.dias_pago_efectivo).toBe(dias);
      expect(result.dias_mora_efectivo).toBe(mora);
      expect(result.monto_descuento_efectivo.toString()).toBe(descuento);
      expect(result.monto_descuento_a_favor.toString()).toBe(reintegro);
      expect(result.monto_descuento_mora.toString()).toBe(cargo);
      expect(result.monto_total_a_favor.toString()).toBe(new Decimal(saldo).minus(fee).toString());
      expect(result.monto_total_por_cobrar.toString()).toBe("0");
      expect(result.fecha_pago_efectivo).toEqual(new Date(pago));
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
      const neto = result.monto_total_neto_inafecto_igv.add(result.monto_total_neto_afecto_igv).add(result.monto_total_igv);
      expect(neto.equals(result.monto_total_a_favor)).toBe(true);
      const movements = result.factoring_liquidacion_financieros;
      expect(movements.filter((item) => item.financiero_concepto.idfinancieroconcepto === 3)).toHaveLength(banco === 1 ? 0 : 1);
      expect(movements[0].monto.toString()).toBe("4000");
    });
  }

  it.each([1, 2])("exoneración en moneda %s elimina únicamente el gasto interbancario", async (moneda) => {
    resetFactoringBoundary(moneda, 2);
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), exonerar_gasto_interbancario: true });
    expect(result.monto_total_a_favor.toString()).toBe("4000");
    expect(result.factoring_liquidacion_financieros.map((item) => item.financiero_concepto.idfinancieroconcepto)).toEqual([7]);
  });
  it.each([
    ["cargo afecto", 2, -1, true, 100, "18", "3882", "0"],
    ["abono afecto", 2, 1, true, 100, "18", "4118", "0"],
    ["cargo inafecto", 4, -1, false, 100, "0", "3900", "0"],
    ["abono inafecto", 4, 1, false, 100, "0", "4100", "0"],
    ["saldo cero", 4, -1, false, 4000, "0", "0", "0"],
    ["saldo por cobrar", 2, -1, true, 5000, "900", "0", "1900"],
  ] as const)("adicional: %s concilia cantidad, IGV y dirección", async (_label, tipo, factor, afecto, monto, igv, favor, cobrar) => {
    b.financieroTipo.getFinancierotipoByFinancierotipoid.mockResolvedValue({ idfinancierotipo: tipo });
    b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, factor, afecto_igv: afecto });
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad: 2, monto_unitario: monto / 2 }] });
    expect(result.monto_total_a_favor.toString()).toBe(favor);
    expect(result.monto_total_por_cobrar.toString()).toBe(cobrar);
    expect(result.factoring_liquidacion_financieros[1].igv.toString()).toBe(igv);
    expect(result.factoring_liquidacion_financieros[1].monto.toString()).toBe(String(monto));
  });
  it("IGV configurado a cero elimina impuesto de un cargo afecto", async () => {
    b.config.getIGV.mockResolvedValue({ valor: "0" });
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), fecha_pago_efectivo: "2026-10-31T05:00:00Z" });
    expect(result.monto_total_igv.toString()).toBe("0");
    expect(result.monto_total_a_favor.toString()).toBe("3673.6");
  });
  it("usa la garantía de la propuesta aceptada, aunque sea distinta del cálculo nuevo", async () => {
    const factoring = resetFactoringBoundary();
    factoring.factoring_propuesta_aceptada.monto_garantia = new Decimal("3999.99");
    expect((await simulateFactoringliquidacionService(liquidationDto())).monto_total_a_favor.toString()).toBe("3999.99");
  });
  it("DT-LIQ-04: conserva el centavo de una garantía histórica aceptada", async () => {
    const factoring = resetFactoringBoundary();
    factoring.monto_neto = new Decimal("100.01");
    factoring.factoring_propuesta_aceptada.porcentaje_financiado_estimado = new Decimal("0.5");
    factoring.factoring_propuesta_aceptada.monto_descuento = new Decimal(1);
    factoring.factoring_propuesta_aceptada.monto_garantia = new Decimal("50.01");
    const simulated = await simulateFactoringliquidacionService(liquidationDto());
    expect(simulated.factoring_liquidacion_financieros[0].monto.toString()).toBe("50.01");
    expect(simulated.monto_total_a_favor.toString()).toBe("50.01");
    const created = await createFactoringliquidacionService(liquidationDto(), 42);
    expect(created.monto_total_a_favor.toString()).toBe("50.01");
  });
  it.each(["2026-10-01T05:00:00Z", "2026-10-01T00:00:00-05:00", "2026-10-02T04:59:59Z"])("el mismo día de Lima %s no genera mora", async (pago) => {
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), fecha_pago_efectivo: pago });
    expect(result.dias_mora_efectivo).toBe(0);
    expect(result.dias_pago_efectivo).toBe(30);
    expect(result.monto_total_a_favor.toString()).toBe("4000");
  });
});

describe("DT-LIQ-03: el concepto determina IGV con cualquier tipo financiero", () => {
  for (const modo of ["simular", "crear"] as const) for (const tipo of [2, 4]) for (const afecto of [false, true]) for (const factor of [-1, 1]) {
    it.each([["0", "0"], ["0.18", "18"], ["0.12345", "12.35"]])(`${modo}, tipo ${tipo}, afecto ${afecto}, factor ${factor}, tasa %s`, async (tasa, impuesto) => {
      b.config.getIGV.mockResolvedValue({ valor: tasa });
      b.financieroTipo.getFinancierotipoByFinancierotipoid.mockResolvedValue({ idfinancierotipo: tipo });
      b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, factor, afecto_igv: afecto });
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad: 2, monto_unitario: 50 }] };
      const result = modo === "simular" ? await simulateFactoringliquidacionService(dto) : await createFactoringliquidacionService(dto, 42);
      const igv = new Decimal(afecto ? impuesto : "0");
      const total = new Decimal(100).plus(igv);
      const saldo = new Decimal(4000).plus(total.mul(factor));
      expect(result.monto_total_a_favor.toString()).toBe(saldo.toString());
      expect(result.monto_total_por_cobrar.toString()).toBe("0");
      expect(result.monto_total_igv.toString()).toBe(igv.mul(factor).toString());
      const grupo = afecto ? "afecto" : "inafecto";
      const direccion = factor === 1 ? "abono" : "cargo";
      // El abono inafecto incluye la garantía de 4 000.
      expect(result[`monto_total_neto_${grupo}_igv_${direccion}`].toString()).toBe(!afecto && factor === 1 ? "4100" : "100");
      if (modo === "crear") {
        const detalle = b.liquidacionFinanciero.insertFactoringliquidacionfinanciero.mock.calls[1][1];
        expect([detalle.monto.toString(), detalle.igv.toString(), detalle.total.toString()]).toEqual(["100", igv.toString(), total.toString()]);
      } else if ("factoring_liquidacion_financieros" in result) {
        const detalle = result.factoring_liquidacion_financieros[1];
        expect([detalle.monto.toString(), detalle.igv.toString(), detalle.total.toString()]).toEqual(["100", igv.toString(), total.toString()]);
      }
    });
  }
});

describe("DT-LIQ-06: gasto sobre el saldo completo", () => {
  for (const modo of ["simular", "crear"] as const) for (const moneda of [1, 2]) for (const banco of [1, 2]) {
    it.each([false, true])(`${modo}, moneda ${moneda}, banco ${banco}, exoneración %s: reintegro sin garantía`, async (exonerar) => {
      const factoring = resetFactoringBoundary(moneda, banco);
      factoring.factoring_propuesta_aceptada.monto_garantia = new Decimal(0);
      const dto = { ...liquidationDto(), fecha_pago_efectivo: "2026-09-01T05:00:00Z", exonerar_gasto_interbancario: exonerar };
      const result = modo === "crear" ? await createFactoringliquidacionService(dto, 42) : await simulateFactoringliquidacionService(dto);
      const gasto = banco === 2 && !exonerar ? moneda === 1 ? 7.5 : 2.5 : 0;
      expect(result.monto_total_a_favor.toString()).toBe(new Decimal(320).minus(gasto).toString());
      const detalles = modo === "crear" ? b.liquidacionFinanciero.insertFactoringliquidacionfinanciero.mock.calls.map((call) => call[1]) : ("factoring_liquidacion_financieros" in result ? result.factoring_liquidacion_financieros : []);
      expect(detalles.filter((fin) => (fin.financiero_concepto.connect?.idfinancieroconcepto ?? fin.financiero_concepto.idfinancieroconcepto) === 3)).toHaveLength(gasto ? 1 : 0);
    });
  }
  it.each([[0, "0"], [5, "5"], [7.5, "7.5"], [7.51, "0.01"]] as const)("saldo previo %s y tarifa 7.50 dejan %s", async (saldo, esperado) => {
    const factoring = resetFactoringBoundary(1, 2);
    factoring.factoring_propuesta_aceptada.monto_garantia = new Decimal(saldo);
    const result = await simulateFactoringliquidacionService(liquidationDto());
    expect(result.monto_total_a_favor.toString()).toBe(esperado);
    expect(result.factoring_liquidacion_financieros.filter((fin) => fin.financiero_concepto.idfinancieroconcepto === 3)).toHaveLength(saldo > 7.5 ? 1 : 0);
  });
  it.each([[-1, 4000, "0", "720"], [1, 100, "4110.5", "0"]] as const)("incluye el adicional y su IGV con factor %s", async (factor, monto, favor, cobrar) => {
    resetFactoringBoundary(1, 2);
    b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, afecto_igv: true, factor });
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, monto_unitario: monto }] });
    expect([result.monto_total_a_favor.toString(), result.monto_total_por_cobrar.toString()]).toEqual([favor, cobrar]);
    expect(new Set(result.factoring_liquidacion_financieros.map((fin) => fin.orden)).size).toBe(result.factoring_liquidacion_financieros.length);
  });
  it("el gasto explícito no recibe otro automático y no admite repetición", async () => {
    resetFactoringBoundary(1, 2);
    b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 3, afecto_igv: false, factor: -1 });
    const item = { financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, monto_unitario: 7.5 };
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), factoring_liquidacion_financieros: [item] });
    expect(result.monto_total_a_favor.toString()).toBe("3992.5");
    expect(result.factoring_liquidacion_financieros.filter((fin) => fin.financiero_concepto.idfinancieroconcepto === 3)).toHaveLength(1);
    await expect(createFactoringliquidacionService({ ...liquidationDto(), factoring_liquidacion_financieros: [item, item] }, 42)).rejects.toMatchObject({ statusCode: 400 });
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
  });
  it("evalúa el total del gasto con IGV, no solo su importe base", async () => {
    const factoring = resetFactoringBoundary(1, 2);
    factoring.factoring_propuesta_aceptada.monto_garantia = new Decimal(9);
    const original = b.concepto.getFinancieroconceptoByIdfinancieroconcepto.getMockImplementation()!;
    b.concepto.getFinancieroconceptoByIdfinancieroconcepto.mockImplementation(async (...args) => {
      const concepto = await original(...args);
      return args[1] === 3 ? { ...concepto, afecto_igv: true } : concepto;
    });
    const result = await simulateFactoringliquidacionService(liquidationDto());
    expect(result.monto_total_a_favor.toString()).toBe("0.15");
    expect(result.factoring_liquidacion_financieros[1].total.toString()).toBe("8.85");
  });
});

describe("DT-LIQ-02-RANGO: rechazo antes de escribir", () => {
  for (const modo of ["simular", "crear"] as const) {
    it.each([["1.00000000001", 100], [1, "100.00000000001"], [2, 60000000], [1, 90000000], [1, Infinity], [1, NaN]])(`${modo}: cantidad %s, unitario %s`, async (cantidad, monto_unitario) => {
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad, monto_unitario }] };
      await expect(modo === "crear" ? createFactoringliquidacionService(dto, 42) : simulateFactoringliquidacionService(dto)).rejects.toMatchObject({ statusCode: 400 });
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
      expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    });
    it(`${modo}: conserva diez decimales y redondea el producto`, async () => {
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad: "3", monto_unitario: "3.3333333333" }] };
      const result = modo === "crear" ? await createFactoringliquidacionService(dto, 42) : await simulateFactoringliquidacionService(dto);
      expect(result.monto_total_a_favor.toString()).toBe("3988.2");
      const detalle = modo === "crear" ? b.liquidacionFinanciero.insertFactoringliquidacionfinanciero.mock.calls[1][1] : ("factoring_liquidacion_financieros" in result ? result.factoring_liquidacion_financieros[1] : undefined);
      expect(detalle.monto_unitario.toString()).toBe("3.3333333333");
      expect(detalle.monto.toString()).toBe("10");
      expect(detalle.igv.toString()).toBe("1.8");
    });
    it(`${modo}: base antigua rechaza precisión ampliada sin escribir`, async () => {
      b.liquidacionFinanciero.hasLiquidacionExtendedPrecision.mockResolvedValue(false);
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad: "1", monto_unitario: "1.001" }] };
      await expect(modo === "crear" ? createFactoringliquidacionService(dto, 42) : simulateFactoringliquidacionService(dto)).rejects.toMatchObject({ statusCode: 400, message: "Para usar más de dos decimales debe actualizarse primero el almacenamiento de liquidaciones" });
      expect(b.config.getIGV).not.toHaveBeenCalled();
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
    });
    it(`${modo}: rechaza acumulado que desborda aunque los detalles caben`, async () => {
      b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, afecto_igv: false, factor: 1 });
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, monto_unitario: 99999990 }] };
      await expect(modo === "crear" ? createFactoringliquidacionService(dto, 42) : simulateFactoringliquidacionService(dto)).rejects.toMatchObject({ statusCode: 400 });
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
    });
  }
});

describe("DT-LIQ-01: cronología por día calendario de Lima", () => {
  for (const modo of ["simular", "crear"] as const) {
    const ejecutar = (pago: string | Date) => {
      const dto = { ...liquidationDto(), fecha_pago_efectivo: pago };
      return modo === "simular" ? simulateFactoringliquidacionService(dto) : createFactoringliquidacionService(dto, 42);
    };

    it.each([
      "2026-08-31T12:00:00-05:00",
      "2026-08-21T12:00:00-05:00",
      "2026-09-01T04:59:59Z",
      "2026-08-31T23:59:59-05:00",
      new Date("2026-09-01T04:59:59Z"),
    ])(`${modo}: rechaza pago anterior %s antes del cálculo y sin escrituras`, async (pago) => {
      await expect(ejecutar(pago)).rejects.toMatchObject({
        statusCode: 400,
        message: "La fecha de pago no puede ser anterior al día de inicio de la operación",
      });
      expect(b.config.getIGV).not.toHaveBeenCalled();
      expect(b.riesgo.getRiesgoByIdriesgo).not.toHaveBeenCalled();
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
      expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    });

    it.each([
      "2026-09-01T05:00:00Z",
      "2026-09-01T00:00:00-05:00",
      new Date("2026-09-01T05:00:00Z"),
    ])(`${modo}: admite el mismo día con hora anterior al inicio %s`, async (pago) => {
      const factoring = resetFactoringBoundary();
      factoring.fecha_operacion = new Date("2026-09-01T23:00:00Z");
      const result = await ejecutar(pago);
      expect(result.dias_pago_efectivo).toBe(0);
      expect(result.monto_descuento_efectivo.toString()).toBe("0");
      expect(result.monto_descuento_a_favor.toString()).toBe("320");
      expect(result.fecha_pago_efectivo).toEqual(new Date(pago));
      if (modo === "crear") expect(b.liquidacion.insertFactoringliquidacion).toHaveBeenCalledTimes(1);
      else expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
    });

    it.each([
      ["anticipado", "2026-09-16T05:00:00Z", 15, 0],
      ["puntual", "2026-10-01T05:00:00Z", 30, 0],
      ["tardío", "2026-10-31T05:00:00Z", 60, 30],
    ] as const)(`${modo}: conserva pago %s posterior al inicio`, async (_label, pago, dias, mora) => {
      const result = await ejecutar(pago);
      expect(result.dias_pago_efectivo).toBe(dias);
      expect(result.dias_mora_efectivo).toBe(mora);
      if (modo === "crear") expect(b.liquidacion.insertFactoringliquidacion).toHaveBeenCalledTimes(1);
    });
  }
});

describe("DT-LIQ-02: signo de conceptos adicionales", () => {
  for (const modo of ["simular", "crear"] as const) {
    const ejecutar = (cantidad?: number, monto_unitario?: number) => {
      const dto = { ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad, monto_unitario }] };
      return modo === "simular" ? simulateFactoringliquidacionService(dto) : createFactoringliquidacionService(dto, 42);
    };
    it.each([
      [-1, 100, "La cantidad no puede ser negativa"],
      [1, -100, "El monto unitario no puede ser negativo"],
      [-1, -100, "La cantidad no puede ser negativa"],
      [1, -0.01, "El monto unitario no puede ser negativo"],
    ] as const)(`${modo}: rechaza cantidad %s y monto %s sin calcular ni insertar`, async (cantidad, monto, message) => {
      await expect(ejecutar(cantidad, monto)).rejects.toMatchObject({ statusCode: 400, message });
      expect(b.config.getIGV).not.toHaveBeenCalled();
      expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
      expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    });
    it.each([[0, 100], [1, 0], [0, 0], [undefined, undefined]])(`${modo}: conserva ceros y valores predeterminados %s/%s`, async (cantidad, monto) => {
      const result = await ejecutar(cantidad, monto);
      expect(result.monto_total_a_favor.toString()).toBe("4000");
      if (modo === "crear") expect(b.liquidacion.insertFactoringliquidacion).toHaveBeenCalledTimes(1);
    });
    it.each([[-1, "3882"], [1, "4118"]] as const)(`${modo}: factor %s mantiene la dirección con importe positivo`, async (factor, saldo) => {
      b.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, factor, afecto_igv: true });
      expect((await ejecutar(1, 100)).monto_total_a_favor.toString()).toBe(saldo);
    });
  }
});

describe("Liquidaciones: validación, persistencia y errores", () => {
  it.each(["operación", "propuesta", "inicio"])("sin %s rechaza tanto simulación como creación sin escrituras", async (missing) => {
    const factoring = resetFactoringBoundary();
    if (missing === "operación") b.factoring.getFactoringByFactoringid.mockResolvedValue(null);
    if (missing === "propuesta") Object.assign(factoring, { factoring_propuesta_aceptada: null });
    if (missing === "inicio") Object.assign(factoring, { fecha_operacion: null });
    const expected = missing === "operación" ? 404 : 400;
    await expect(simulateFactoringliquidacionService(liquidationDto())).rejects.toMatchObject({ statusCode: expected });
    await expect(createFactoringliquidacionService(liquidationDto(), 42)).rejects.toMatchObject({ statusCode: expected });
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
    expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
  });
  it.each(["tipo", "concepto"])("adicional con %s desconocido produce 404 sin guardar", async (missing) => {
    (missing === "tipo" ? b.financieroTipo.getFinancierotipoByFinancierotipoid : b.concepto.getFinancieroconceptoByFinancieroconceptoid).mockResolvedValue(null);
    await expect(createFactoringliquidacionService({ ...liquidationDto(), factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, monto_unitario: 100 }] }, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
  });
  it("estado desconocido no inserta cabecera ni detalles", async () => {
    b.liquidacionEstado.getFactoringliquidacionestadoByFactoringliquidacionestadoid.mockResolvedValue(null);
    await expect(createFactoringliquidacionService(liquidationDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
  });
  it("guarda saldo, actor y detalles con la misma transacción de escritura", async () => {
    resetFactoringBoundary(1, 2);
    const result = await createFactoringliquidacionService(liquidationDto(), 42);
    expect(result.monto_total_a_favor.toString()).toBe("3992.5");
    expect(result).toMatchObject({ idusuariocrea: 42, idusuariomod: 42, factoring: { connect: { idfactoring: 10 } } });
    expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).toHaveBeenCalledTimes(2);
    for (const [tx, detail] of b.liquidacionFinanciero.insertFactoringliquidacionfinanciero.mock.calls) {
      expect(tx).toBe(b.tx);
      expect(detail).toMatchObject({ factoring_liquidacion: { connect: { idfactoringliquidacion: 200 } }, idusuariocrea: 42 });
      expect(detail.total.equals(detail.monto.add(detail.igv))).toBe(true);
    }
  });
  it.each(["cabecera", "detalle"])("fallo en %s se propaga sin resultado exitoso", async (stage) => {
    const error = new Error(`persistencia ${stage}`);
    (stage === "cabecera" ? b.liquidacion.insertFactoringliquidacion : b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).mockRejectedValueOnce(error);
    await expect(createFactoringliquidacionService(liquidationDto(), 42)).rejects.toBe(error);
    if (stage === "cabecera") expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    else expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).toHaveBeenCalledTimes(1);
  });
  it("flujo: una propuesta generada alimenta la liquidación sin cambiar importes aceptados", async () => {
    const factoring = resetFactoringBoundary();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-01T05:00:00Z"));
    const propuesta = await createFactoringpropuestaService(proposalDto(), 42);
    // La aceptación en BD se sustituye por el fixture; no simula su política de aprobación.
    Object.assign(factoring.factoring_propuesta_aceptada, propuesta);
    const result = await createFactoringliquidacionService(liquidationDto(), 42);
    expect(propuesta.monto_descuento?.toString()).toBe("320");
    expect(result.monto_descuento_a_favor.toString()).toBe("0");
    expect(result.monto_descuento_mora.toString()).toBe("0");
    expect(result.monto_total_a_favor.toString()).toBe("4000");
  });
  it("cambio de estado guarda el actor y fecha solicitados", async () => {
    await updateFactoringliquidacionService({ factoringliquidacionid: ids.liquidacion, factoringliquidacionestadoid: ids.estado, fecha_liquidacion: liquidationDto().fecha_liquidacion }, 42);
    expect(b.liquidacion.updateFactoringliquidacion).toHaveBeenCalledWith(b.tx, ids.liquidacion, expect.objectContaining({ idusuariomod: 42, fecha_liquidacion: liquidationDto().fecha_liquidacion }));
  });
  it.each(["liquidación", "estado"])("cambio con %s inexistente no escribe", async (missing) => {
    (missing === "liquidación" ? b.liquidacion.getFactoringliquidacionByFactoringliquidacionid : b.liquidacionEstado.getFactoringliquidacionestadoByFactoringliquidacionestadoid).mockResolvedValue(null);
    await expect(updateFactoringliquidacionService({ factoringliquidacionid: ids.liquidacion, factoringliquidacionestadoid: ids.estado, fecha_liquidacion: liquidationDto().fecha_liquidacion }, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.liquidacion.updateFactoringliquidacion).not.toHaveBeenCalled();
  });
});
