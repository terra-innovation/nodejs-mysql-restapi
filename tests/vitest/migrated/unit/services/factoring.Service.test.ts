import { describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";
import { DateTime } from "luxon";

vi.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: {
    client: {
      $transaction: vi.fn(async (cb) => cb({})),
    },
    transactionTimeout: 5000,
  },
}));

vi.mock("#root/src/daos/configuracionapp.Dao.js", () => ({
  getIGV: vi.fn().mockResolvedValue({ valor: "0.18" }),
  getCostoCAVALIPen: vi.fn().mockResolvedValue({ valor: "10.00" }),
  getCostoCAVALIUsd: vi.fn().mockResolvedValue({ valor: "3.00" }),
  getComisionBCPPen: vi.fn().mockResolvedValue({ valor: "5.00" }),
  getComisionBCPUsd: vi.fn().mockResolvedValue({ valor: "1.50" }),
}));

vi.mock("#root/src/daos/riesgo.Dao.js", () => ({
  getRiesgoByIdriesgo: vi.fn().mockResolvedValue({ idriesgo: 1 }),
}));

vi.mock("#root/src/daos/factoringconfigcomision.Dao.js", async () => {
  const { Decimal } = await vi.importActual<typeof import("@prisma/client/runtime/client")>("@prisma/client/runtime/client");
  return {
    getFactoringconfigcomisionByIdriesgo: vi.fn().mockResolvedValue({
      factor1: new Decimal(0.01),
      factor2: new Decimal(100),
      factor3: new Decimal(1),
    }),
  };
});

vi.mock("#root/src/daos/financierotipo.Dao.js", () => ({
  getComision: vi.fn().mockResolvedValue({ idfinancierotipo: 1 }),
  getCosto: vi.fn().mockResolvedValue({ idfinancierotipo: 2 }),
  getGasto: vi.fn().mockResolvedValue({ idfinancierotipo: 3 }),
  getGasto_excento_igv: vi.fn().mockResolvedValue({ idfinancierotipo: 4 }),
}));

vi.mock("#root/src/daos/financieroconcepto.Dao.js", () => ({
  getComisionFinanzaTech: vi.fn().mockResolvedValue({ idfinancieroconcepto: 1 }),
  getCostoCAVALIPen: vi.fn().mockResolvedValue({ idfinancieroconcepto: 2 }),
  getCostoTransaccion: vi.fn().mockResolvedValue({ idfinancieroconcepto: 3 }),
  getGastoInterbancario: vi.fn().mockResolvedValue({ idfinancieroconcepto: 4 }),
}));

import { simulateFactoringLogicV4 } from "#root/src/services/admin/factoringCalculation.Service.js";

describe("factoring.Service - Unit Tests", () => {
  it("debe calcular correctamente las tasas tda y tdd y los montos de financiamiento", async () => {
    const idriesgooperacion = 1;
    const idbancocedente = 1; // BCP (sin gasto interbancario adicional)
    const cantidad_facturas = 1;
    const monto_neto = new Decimal(10000);
    const fecha_ahora = DateTime.fromISO("2026-09-01T00:00:00.000Z");
    const fecha_fin = DateTime.fromISO("2026-10-01T00:00:00.000Z"); // 30 días
    const fecha_emision = DateTime.fromISO("2026-08-01T00:00:00.000Z");
    const porcentaje_financiado = new Decimal(0.8); // 80%
    const tdm = new Decimal(0.02); // 2% mensual
    const porcentaje_comision_descuento = new Decimal(0);
    const idmoneda = 1; // PEN

    const result = await simulateFactoringLogicV4(idriesgooperacion, idbancocedente, cantidad_facturas, monto_neto, fecha_ahora, fecha_fin, fecha_emision, porcentaje_financiado, tdm, porcentaje_comision_descuento, idmoneda);

    // Verificación de tasa mensual tdm
    expect(result.tdm?.toNumber()).toBe(0.02);

    // Tasa diaria descontada (tdd): (1 + 0.02)^(1/30) - 1 ≈ 0.0006598286
    expect(result.tdd).toBeDefined();
    const expectedTdd = new Decimal(1).add(tdm).pow(new Decimal(1).div(30)).minus(1).toDecimalPlaces(10);
    expect(result.tdd?.toString()).toBe(expectedTdd.toString());

    // Tasa anual (tda): (1 + 0.02)^12 - 1 ≈ 0.2682417946
    expect(result.tda).toBeDefined();
    const expectedTda = new Decimal(1).add(tdm).pow(12).minus(1).toDecimalPlaces(10);
    expect(result.tda?.toString()).toBe(expectedTda.toString());

    // Monto efectivo = 10000 * 0.8 = 8000
    expect(result.monto_efectivo?.toNumber()).toBe(8000);

    // Monto garantía = 10000 * 0.2 = 2000
    expect(result.monto_garantia?.toNumber()).toBe(2000);

    // Días estimado = 30 días
    expect(result.dias_pago_estimado).toBe(30);
  });
});
