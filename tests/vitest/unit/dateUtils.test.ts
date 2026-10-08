import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDateUtcMidnight } from "#src/utils/dateUtils.js";
import { ClientError } from "#src/utils/CustomErrors.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("Fecha civil por defecto en el cambio de día de Lima", () => {
  it.each([
    ["2026-10-07T04:59:59.999Z", "2026-10-06T00:00:00.000Z"],
    ["2026-10-07T05:00:00.000Z", "2026-10-07T00:00:00.000Z"],
    ["2027-01-01T04:59:59.999Z", "2026-12-31T00:00:00.000Z"],
    ["2027-01-01T05:00:00.000Z", "2027-01-01T00:00:00.000Z"],
  ])("instante %s produce DATE %s", (now, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));

    expect(parseDateUtcMidnight()).toEqual(new Date(expected));
    expect(parseDateUtcMidnight(null)).toEqual(new Date(expected));
  });
});

describe("Validación de fechas civiles", () => {
  it.each(["2026-02-29", "2026-13-01", "fecha-inválida"])("rechaza %s con error de cliente", (input) => {
    expect(() => parseDateUtcMidnight(input)).toThrow(ClientError);
    expect(() => parseDateUtcMidnight(input)).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  it("acepta el día bisiesto sin aplicar desplazamiento horario", () => {
    expect(parseDateUtcMidnight("2028-02-29")).toEqual(new Date("2028-02-29T00:00:00.000Z"));
  });
});
