import { calculateFactoringPeriod } from "#root/src/domain/factoring/factoring.Calculator.js";
import * as dateUtils from "#src/utils/dateUtils.js";
import { DateTime, Settings } from "luxon";

describe("Utilidades de fechas: días calendario de Perú", () => {
  const originalZone = Settings.defaultZone;
  afterEach(() => { Settings.defaultZone = originalZone; });

  const scenarios = [
    ["entrada real desde navegador Lima", "2026-10-01T05:00:00Z", "2026-10-11T05:00:00Z", 10],
    ["instantes históricos a medianoche UTC", "2026-10-01T00:00:00Z", "2026-10-11T00:00:00Z", 10],
    ["pago anticipado", "2026-10-01T05:00:00Z", "2026-09-26T05:00:00Z", -5],
    ["pago puntual", "2026-10-01T05:00:00Z", "2026-10-01T23:59:00-05:00", 0],
    ["pago al día siguiente", "2026-10-01T23:59:00Z", "2026-10-02T05:00:00Z", 1],
    ["distintas fechas UTC en el mismo día peruano", "2026-10-01T23:00:00Z", "2026-10-02T04:59:59Z", 0],
    ["cambio de día peruano", "2026-10-02T04:59:59Z", "2026-10-02T05:00:00Z", 1],
    ["fin de semana", "2026-10-02T05:00:00Z", "2026-10-05T05:00:00Z", 3],
    ["febrero no bisiesto", "2027-02-28T05:00:00Z", "2027-03-01T05:00:00Z", 1],
    ["febrero bisiesto", "2028-02-28T05:00:00Z", "2028-03-01T05:00:00Z", 2],
    ["cambio de año", "2026-12-31T05:00:00Z", "2027-01-01T05:00:00Z", 1],
  ] as const;

  for (const zone of ["UTC", "America/Lima", "Europe/Madrid", "America/New_York"]) {
    it.each(scenarios)(`${zone}: %s`, (_label, startISO, endISO, expected) => {
      Settings.defaultZone = zone;
      const start = DateTime.fromJSDate(new Date(startISO));
      const end = DateTime.fromJSDate(new Date(endISO));
      expect(dateUtils.calculateCalendarDaysInLima(start, end)).toBe(expected);
      const period = calculateFactoringPeriod(start, end, start);
      expect(period.dias_pago_estimado).toBe(expected);
      expect(period.fecha_propuesta).toEqual(new Date(startISO));
      expect(period.fecha_pago_estimado).toEqual(new Date(endISO));
    });
  }

  it("mantiene separadas las fechas DATE de emisión y los instantes TIMESTAMP", () => {
    Settings.defaultZone = "UTC";
    const stored = new Date("2026-09-01T00:00:00Z");
    expect(dateUtils.toLimaDate(stored).toISODate()).toBe("2026-09-01");
    expect(dateUtils.toLimaDateTime(stored).toISODate()).toBe("2026-08-31");
    expect(dateUtils.parseDateUtcMidnight("2026-09-01")).toEqual(stored);
    const period = calculateFactoringPeriod(DateTime.fromISO("2026-09-02T05:00:00Z"), DateTime.fromISO("2026-10-01T05:00:00Z"), dateUtils.toLimaDate(stored));
    expect(period.dias_antiguedad_estimado).toBe(1);
  });
});
