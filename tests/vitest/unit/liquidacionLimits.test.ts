import { describe, expect, it } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import { assertLiquidacionDecimal, calculateLiquidacionAmount, getLiquidacionInputError } from "#src/domain/factoring/liquidacionLimits.js";

describe("DT-LIQ-02-RANGO: precisión y capacidad técnica, no máximo legal", () => {
  it.each([0, 1.01, "1.2300", "1e-2", "0.001", "3.3333333333", "99999999.9999999999", undefined])("admite %s", (value) => {
    expect(getLiquidacionInputError(value, "La cantidad")).toBeNull();
  });
  it.each(["0.00000000001", "1.23000000001", "1e-11", "99999999.99999999999"])("rechaza exceso de decimales sin redondear %s", (value) => {
    expect(getLiquidacionInputError(value, "La cantidad")).toContain("diez decimales");
  });
  it.each([NaN, Infinity, -Infinity, "texto", "100000000", -1])("rechaza %s", (value) => {
    expect(getLiquidacionInputError(value, "El monto unitario")).not.toBeNull();
  });
  it.each(["99999999.99", "-99999999.99", "0"])("resultado monetario representable %s", (value) => {
    expect(() => assertLiquidacionDecimal(new Decimal(value), "Saldo")).not.toThrow();
  });
  it.each(["100000000", "-100000000", "0.001", "Infinity", "NaN"])("resultado no representable %s", (value) => {
    expect(() => assertLiquidacionDecimal(new Decimal(value), "Saldo")).toThrow();
  });
  it("la proporción tiene una capacidad distinta al importe", () => {
    expect(() => assertLiquidacionDecimal(new Decimal("99999.99999"), "Proporción", 10, 5)).not.toThrow();
    expect(() => assertLiquidacionDecimal(new Decimal("100000"), "Proporción", 10, 5)).toThrow();
  });
  it("multiplica el unitario completo y redondea el importe al final", () => {
    expect(calculateLiquidacionAmount(new Decimal(3), new Decimal("3.3333333333")).toString()).toBe("10");
    expect(calculateLiquidacionAmount(new Decimal("0.0000000001"), new Decimal("99999999.9999999999")).toString()).toBe("0.01");
  });
});
