import { describe, expect, it } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";
import { accionesPeriodo, evaluarSaldo, limiteCorte, temporalidad, totalSaldo, validarFechas } from "#src/domain/factoring/saldocontable/saldocontable.Policy.js";
import type { FuenteSaldo } from "#src/domain/factoring/saldocontable/saldocontable.Policy.js";

const fechas = { fecha_inicio: "2026-04-01", fecha_fin: "2026-06-30", fecha_corte: "2026-06-30" };
const fuente = (overrides: Partial<FuenteSaldo> = {}): FuenteSaldo => ({ estado: 1, fecha_operacion: new Date("2026-01-10T15:00:00Z"), propuesta: { pertenece: true, estado: 1, monto_neto: new Decimal("10000.25") }, moneda: "USD", liquidaciones: [], ...overrides });
describe("Saldo contable al corte civil de Lima", () => {
  it("incluye cartera antigua y conserva precisión del producto", () => {
    expect(evaluarSaldo(fuente(), fechas.fecha_corte, new Decimal("3.410001"))).toMatchObject({ elegible: true, calculable: true, monto_neto: "10000.25", tipo_cambio: "3.410001", monto_saldo_contable: "34100.86250025" });
    expect(evaluarSaldo(fuente(), "2026-03-31", new Decimal(3)).calculable).toBe(true);
  });
  it.each(["2026-04-15T18:00:00Z", "2026-07-01T04:59:59Z"])("excluye cobro total %s hasta final del corte", (pago) => {
    const e = evaluarSaldo(fuente({ liquidaciones: [{ fecha_pago_efectivo: new Date(pago) }] }), fechas.fecha_corte, new Decimal(3));
    expect(e.calculable).toBe(false);
    expect(e.motivos.map((m) => m.codigo)).toContain("PAGADA_AL_CORTE");
  });
  it("cobro posterior al corte mantiene pendiente el neto", () => {
    expect(evaluarSaldo(fuente({ liquidaciones: [{ fecha_pago_efectivo: new Date("2026-07-01T05:00:00Z") }] }), fechas.fecha_corte, new Decimal(3)).calculable).toBe(true);
    expect(limiteCorte("2026-06-30").toISOString()).toBe("2026-07-01T05:00:00.000Z");
  });
  it("PEN usa 1 sin depender de registro SBS y USD bloquea contable faltante", () => {
    expect(evaluarSaldo(fuente({ moneda: "PEN" }), fechas.fecha_corte, null)).toMatchObject({ calculable: true, tipo_cambio: "1.000000", monto_saldo_contable: "10000.25000000" });
    expect(evaluarSaldo(fuente(), fechas.fecha_corte, null)).toMatchObject({ elegible: true, calculable: false, monto_saldo_contable: null, motivos: [{ codigo: "SIN_TIPO_CAMBIO_CONTABLE", mensaje: expect.stringContaining("Actualice") }] });
  });
  it.each([null, new Decimal(0), new Decimal(-1)])("no usa un contable inválido %s", (tc) => expect(evaluarSaldo(fuente(), fechas.fecha_corte, tc).calculable).toBe(false));
  it("explica propuesta ausente, varias vigentes, inicio posterior y operación inactiva", () => {
    const e = evaluarSaldo(fuente({ estado: 2, propuesta: null, fecha_operacion: new Date("2026-07-01T05:00:00Z"), liquidaciones: [{ fecha_pago_efectivo: new Date() }, { fecha_pago_efectivo: new Date() }] }), fechas.fecha_corte, new Decimal(3));
    expect(e.motivos.map((m) => m.codigo)).toEqual(expect.arrayContaining(["OPERACION_INACTIVA", "SIN_PROPUESTA_ACEPTADA", "INICIO_POSTERIOR_CORTE", "VARIAS_LIQUIDACIONES_VIGENTES"]));
  });
  it("rechaza propuesta de otra operación y evidencia de cobro contradictoria", () => {
    const e = evaluarSaldo(fuente({ propuesta: { pertenece: false, estado: 1, monto_neto: new Decimal(10) }, liquidaciones: [{ fecha_pago_efectivo: new Date("2025-01-01") }] }), fechas.fecha_corte, new Decimal(3));
    expect(e.motivos.map((m) => m.codigo)).toContain("SIN_PROPUESTA_ACEPTADA");
    expect(e.motivos.map((m) => m.codigo)).toContain("COBRO_ANTERIOR_INICIO");
  });
  it("suma preciso y redondea el agregado, sin redondear cada fila primero", () => {
    expect(totalSaldo(["0.00500000", "0.00500000"])).toBe("0.01000000");
  });
  it("conserva los ocho decimales incluso en el máximo de las columnas fuente", () => {
    const e = evaluarSaldo(fuente({ propuesta: { pertenece: true, estado: 1, monto_neto: new Decimal("99999999.99") } }), fechas.fecha_corte, new Decimal("999999.999999"));
    expect(e.monto_saldo_contable).toBe("99999999989900.00000001");
    expect(totalSaldo([e.monto_saldo_contable!, "0.00000001"])).toBe("99999999989900.00000002");
  });
  it("acepta períodos flexibles y rechaza fechas inexistentes o invertidas", () => {
    expect(validarFechas({ fecha_inicio: "2026-01-01", fecha_fin: "2026-12-31", fecha_corte: "2027-01-02" })).toBeNull();
    expect(validarFechas({ ...fechas, fecha_fin: "2026-02-30" })).not.toBeNull();
    expect(validarFechas({ ...fechas, fecha_inicio: "2026-07-01" })).not.toBeNull();
  });
  it("curso y futuro no permiten asociaciones ni cierre; el día de corte completo sigue en curso", () => {
    const now = new Date("2026-07-01T04:59:59Z");
    expect(temporalidad(fechas, now)).toBe("EN_CURSO");
    expect(accionesPeriodo(fechas, true, false, now)).toMatchObject({ editar: true, asociar: false, retirar: false, cerrar: false });
    expect(accionesPeriodo(fechas, true, false, new Date("2026-03-01"))).toMatchObject({ temporalidad: "FUTURO", asociar: false });
    expect(accionesPeriodo(fechas, true, false, new Date("2026-07-01T05:00:00Z")).asociar).toBe(true);
  });
  it("cerrado bloquea toda mutación y eliminado solo permite activar", () => {
    const now = new Date("2026-10-01");
    expect(accionesPeriodo(fechas, true, true, now)).toMatchObject({ editar: false, eliminar: false, activar: false, asociar: false, cerrar: false });
    expect(accionesPeriodo(fechas, false, false, now)).toMatchObject({ editar: false, activar: true, asociar: false });
  });
});
