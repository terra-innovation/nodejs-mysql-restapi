import { expect, it } from "vitest";
import { importePago, disponiblePago, resumenPago } from "#src/domain/factoring/factoringPago.Policy.js";
it.each(["0", "-1", "1.001", "1,00", "1e2", "NaN"])("rechaza importe inválido %s", (value) => {
  expect(() => importePago(value)).toThrow();
});
it("conserva exactitud decimal y diferencias de céntimos en ambos sentidos", () => {
  expect(resumenPago("10000", "9999.98").diferencia_pago).toBe("0.02");
  expect(resumenPago("10000", "10000.03").diferencia_pago).toBe("-0.03");
  expect(importePago("999999999999999999.99").toFixed(2)).toBe("999999999999999999.99");
});
it("no inventa referencia cuando falta propuesta aceptada", () => {
  expect(resumenPago(null, "20")).toEqual({ monto_referencia: null, monto_total_pagado: "20.00", diferencia_pago: null });
});
it("conserva céntimos cuando el acumulado supera el tamaño de un abono individual", () => {
  expect(resumenPago("100.00", "1999999999999999999.98").diferencia_pago).toBe("-1999999999999999899.98");
});
it("permite reparto parcial sin superar el disponible bancario", () => {
  expect(disponiblePago("15000", "10000", "5000").toFixed(2)).toBe("5000.00");
  expect(() => disponiblePago("15000", "10000", "5000.01")).toThrow();
});
