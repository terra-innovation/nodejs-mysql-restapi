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
  it.each(["2026-10-01T05:00:00Z", "2026-10-01T00:00:00-05:00", "2026-10-02T04:59:59Z"])("el mismo día de Lima %s no genera mora", async (pago) => {
    const result = await simulateFactoringliquidacionService({ ...liquidationDto(), fecha_pago_efectivo: pago });
    expect(result.dias_mora_efectivo).toBe(0);
    expect(result.dias_pago_efectivo).toBe(30);
    expect(result.monto_total_a_favor.toString()).toBe("4000");
  });
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
