import { describe, expect, it } from "vitest";
import { identidad, importe, normalizarOrigen, legado, fechaCivil } from "#src/domain/banca/transaccionBancaria.Policy.js";
const row = { cuenta: "PEN-A", numerooperacion: "00001234", fecha: "2026-10-15", descripcion: "Transferencia sintética", sumaoresta: "Resta", moneda: "PEN", monto: "-123456789012345678.91" };
describe("normalización bancaria", () => {
  it("conserva precisión decimal, ceros de operación y separa signo/magnitud", () => {
    const n = normalizarOrigen(row, 10, "PEN");
    expect(n.monto).toBe("123456789012345678.91");
    expect(n.signo).toBe(-1);
    expect(n.numero_operacion).toBe("00001234");
    expect(JSON.parse(n.identidad_datos)).toEqual(["10", "2026-10-15", "00001234", "-1", "123456789012345678.91"]);
  });
  it("descripción no altera identidad; cuenta, signo y monto sí", () => {
    expect(normalizarOrigen({ ...row, descripcion: "Otra descripción" }, 10, "PEN").identidad_sha256).toBe(normalizarOrigen(row, 10, "PEN").identidad_sha256);
    expect(identidad(11, row.fecha, row.numerooperacion, -1, "1.00").identidad_sha256).not.toBe(identidad(10, row.fecha, row.numerooperacion, -1, "1.00").identidad_sha256);
  });
  it.each(["-1.00", "0", "0.00", "1.001", "1,000.00", "1e2", "1000000000000000000.00", "NaN"])("rechaza importe operativo %s", (value) => expect(() => importe(value)).toThrow());
  it("rechaza moneda y signo contradictorios, deriva signo ausente", () => {
    expect(() => normalizarOrigen({ ...row, moneda: "USD" }, 10, "PEN")).toThrow("MONEDA");
    expect(() => normalizarOrigen({ ...row, sumaoresta: "+" }, 10, "PEN")).toThrow("SIGNO");
    expect(normalizarOrigen({ ...row, sumaoresta: null }, 10, "PEN").signo).toBe(-1);
  });
  it("valida fecha civil real, preserva nulos y no inventa netos/comisiones", () => {
    expect(() => fechaCivil("2026-02-30")).toThrow();
    expect(fechaCivil("2024-02-29")).toBe("2024-02-29");
    const good = legado({ tipooperacion: "Transferencia", monto_neto: "-95.00", origen_comision: "0", detalle_hora: "23:59:59" }, -1);
    expect(good.values.monto_neto).toBe("95.00");
    expect(good.values.origen_comision).toBe("0.00");
    expect(good.values.destino_comision).toBeNull();
    expect(good.problemas).toEqual([]);
    const observed = legado({ monto_neto: "12.00", origen_comision: "-1", detalle_hora: "25:00:00" }, -1);
    expect(observed.problemas).toEqual(expect.arrayContaining(["monto_neto", "detalle_hora"]));
    expect(observed.values.origen_comision).toBe("1.00");
  });
});
it.each([
  ["12:00 AM", "00:00:00"],
  ["12:00 PM", "12:00:00"],
  ["1:05 pm", "13:05:00"],
  ["11:59:58 PM", "23:59:58"],
  ["06:30:00", "06:30:00"],
])("normaliza hora %s sin cambiar su significado", (input, expected) => {
  expect(legado({ detalle_hora: input }, 1).values.detalle_hora).toBe(expected);
});
it.each(["00:10 AM", "13:10 PM", "12:99 PM", "12:10:99 PM"])("no acepta una hora inválida %s", (input) => expect(legado({ detalle_hora: input }, 1).problemas).toContain("detalle_hora"));
it("normaliza ambas comisiones a magnitud y mantiene la regla de signo del monto neto", () => {
  const result = legado({ origen_comision: "-1.25", destino_comision: "-0.50", monto_neto: "100.00" }, -1);
  expect(result.values).toMatchObject({ origen_comision: "1.25", destino_comision: "0.50", monto_neto: null });
  expect(result.problemas).toEqual(["monto_neto"]);
});
