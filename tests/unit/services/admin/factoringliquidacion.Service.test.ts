import { Decimal } from "@prisma/client/runtime/client";

// Mocking prismaFT
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: {
    client: {
      $transaction: jest.fn(async (cb) => cb({})),
    },
    transactionTimeout: 5000,
  },
}));

// Mocking DAOs
jest.mock("#root/src/daos/factoring.Dao.js", () => ({
  getFactoringByFactoringid: jest.fn(),
  getFactoringByIdfactoring: jest.fn(),
}));

jest.mock("#root/src/daos/factoringliquidacion.Dao.js", () => ({
  insertFactoringliquidacion: jest.fn().mockResolvedValue({ idfactoringliquidacion: 20 }),
}));

jest.mock("#root/src/daos/factoringliquidacionestado.Dao.js", () => ({
  getFactoringliquidacionestadoByFactoringliquidacionestadoid: jest.fn().mockResolvedValue({ idfactoringliquidacionestado: 1 }),
}));

jest.mock("#root/src/daos/factoringliquidacionfinanciero.Dao.js", () => ({
  insertFactoringliquidacionfinanciero: jest.fn(),
}));

jest.mock("#root/src/daos/configuracionapp.Dao.js", () => ({
  getComisionBCPPen: jest.fn().mockResolvedValue({ valor: "7.50" }),
  getComisionBCPUsd: jest.fn().mockResolvedValue({ valor: "2.50" }),
  getIGV: jest.fn().mockResolvedValue({ valor: "0.18" }),
}));

jest.mock("#root/src/daos/financierotipo.Dao.js", () => ({
  getFinancierotipoByIdfinancierotipo: jest.fn().mockResolvedValue({ idfinancierotipo: 2 }),
  getFinancierotipoByFinancierotipoid: jest.fn().mockResolvedValue({ idfinancierotipo: 2 }),
  getFinancierotipos: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/financieroconcepto.Dao.js", () => ({
  getFinancieroconceptoByIdfinancieroconcepto: jest.fn().mockImplementation((_tx, id) => {
    // id 7: garantia (abono, factor 1, afecto_igv: false)
    if (id === 7) return Promise.resolve({ idfinancieroconcepto: 7, factor: 1, afecto_igv: false });
    // id 8: descuento a favor (abono, factor 1, afecto_igv: false)
    if (id === 8) return Promise.resolve({ idfinancieroconcepto: 8, factor: 1, afecto_igv: false });
    // id 9: descuento mora (cargo, factor -1, afecto_igv: false)
    if (id === 9) return Promise.resolve({ idfinancieroconcepto: 9, factor: -1, afecto_igv: false });
    // id 3: gasto interbancario (cargo, factor -1, afecto_igv: false)
    return Promise.resolve({ idfinancieroconcepto: id, factor: -1, afecto_igv: false });
  }),
  getFinancieroconceptoByFinancieroconceptoid: jest.fn(),
  getFinancieroconceptosForLiquidacion: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/services/admin/factoringCalculation.Service.js", () => ({
  simulateFactoringLogicV4: jest.fn(),
}));

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringliquidacionDao from "#root/src/daos/factoringliquidacion.Dao.js";
import * as factoringliquidacionfinancieroDao from "#root/src/daos/factoringliquidacionfinanciero.Dao.js";
import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import { simulateFactoringLogicV4 } from "#root/src/services/admin/factoringCalculation.Service.js";
import { createFactoringliquidacionService, simulateFactoringliquidacionService } from "#root/src/services/admin/factoringliquidacion.Service.js";
import { ClientError } from "#src/utils/CustomErrors.js";

describe("admin/factoringliquidacion.Service - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFactoring = {
    idfactoring: 10,
    monto_neto: new Decimal(20000),
    cantidad_facturas: 2,
    fecha_operacion: new Date("2026-09-01T00:00:00.000Z"),
    fecha_emision: new Date("2026-08-15T00:00:00.000Z"),
    idmoneda: 1, // PEN
    cuenta_bancaria: { idbanco: 1 }, // Mismo banco BCP
    moneda: { idmoneda: 1 },
    factoring_propuesta_aceptada: {
      idriesgooperacion: 1,
      porcentaje_financiado_estimado: new Decimal(0.8),
      tdm: new Decimal(0.02),
      porcentaje_comision_descuento: new Decimal(0),
      fecha_pago_estimado: new Date("2026-10-01T00:00:00.000Z"), // 30 días
      monto_descuento: new Decimal(400),
      monto_garantia: new Decimal(4000), // 20%
    },
  };

  describe("validación de requisitos de liquidación", () => {
    const dto = {
      factoringid: "factoring-uuid-1",
      fecha_liquidacion: new Date("2026-09-26T12:00:00.000Z"),
      fecha_pago_efectivo: new Date("2026-09-26T12:00:00.000Z"),
    };
    const mensaje = "La operación no tiene fecha de inicio. No es posible calcular la liquidación";

    it.each([
      { propuesta: null, fecha_operacion: mockFactoring.fecha_operacion },
      { propuesta: undefined, fecha_operacion: mockFactoring.fecha_operacion },
      { propuesta: null, fecha_operacion: null },
    ])("debe rechazar la simulación sin propuesta aceptada: %p", async ({ propuesta, fecha_operacion }) => {
      (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue({
        ...mockFactoring,
        factoring_propuesta_aceptada: propuesta,
        fecha_operacion,
      });

      const simulation = simulateFactoringliquidacionService(dto);

      await expect(simulation).rejects.toBeInstanceOf(ClientError);
      await expect(simulation).rejects.toMatchObject({ statusCode: 400, message: "El factoring no cuenta con una propuesta aceptada" });
      expect(simulateFactoringLogicV4).not.toHaveBeenCalled();
      expect(configuracionappDao.getIGV).not.toHaveBeenCalled();
    });

    it.each([
      { propuesta: null, fecha_operacion: mockFactoring.fecha_operacion },
      { propuesta: undefined, fecha_operacion: mockFactoring.fecha_operacion },
      { propuesta: null, fecha_operacion: null },
    ])("debe rechazar la creación sin propuesta aceptada sin guardar datos: %p", async ({ propuesta, fecha_operacion }) => {
      (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue({
        ...mockFactoring,
        factoring_propuesta_aceptada: propuesta,
        fecha_operacion,
      });

      const creation = createFactoringliquidacionService({ ...dto, factoringliquidacionestadoid: "estado-uuid-1" }, 1);

      await expect(creation).rejects.toBeInstanceOf(ClientError);
      await expect(creation).rejects.toMatchObject({ statusCode: 400, message: "El factoring no cuenta con una propuesta aceptada" });
      expect(simulateFactoringLogicV4).not.toHaveBeenCalled();
      expect(factoringliquidacionDao.insertFactoringliquidacion).not.toHaveBeenCalled();
      expect(factoringliquidacionfinancieroDao.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    });

    it.each([null, undefined, ""])("debe rechazar la simulación con fecha de inicio %p antes de calcular", async (fecha_operacion) => {
      (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue({ ...mockFactoring, fecha_operacion });

      const simulation = simulateFactoringliquidacionService(dto);

      await expect(simulation).rejects.toBeInstanceOf(ClientError);
      await expect(simulation).rejects.toMatchObject({ statusCode: 400, message: mensaje });
      expect(simulateFactoringLogicV4).not.toHaveBeenCalled();
      expect(configuracionappDao.getIGV).not.toHaveBeenCalled();
    });

    it.each([null, undefined, ""])("debe rechazar la creación con fecha de inicio %p sin guardar datos", async (fecha_operacion) => {
      (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue({ ...mockFactoring, fecha_operacion });

      const creation = createFactoringliquidacionService({ ...dto, factoringliquidacionestadoid: "estado-uuid-1" }, 1);

      await expect(creation).rejects.toBeInstanceOf(ClientError);
      await expect(creation).rejects.toMatchObject({ statusCode: 400, message: mensaje });
      expect(simulateFactoringLogicV4).not.toHaveBeenCalled();
      expect(factoringliquidacionDao.insertFactoringliquidacion).not.toHaveBeenCalled();
      expect(factoringliquidacionfinancieroDao.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
    });

    it("debe crear la liquidación usando la fecha de inicio almacenada cuando es válida", async () => {
      (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(mockFactoring);
      (simulateFactoringLogicV4 as jest.Mock).mockResolvedValue({ dias_pago_estimado: 25, monto_descuento: new Decimal(320) });

      const result = await createFactoringliquidacionService({ ...dto, factoringliquidacionestadoid: "estado-uuid-1" }, 1);

      expect(result).toEqual({ idfactoringliquidacion: 20 });
      const fechaInicio = (simulateFactoringLogicV4 as jest.Mock).mock.calls[0][4];
      expect(fechaInicio.toJSDate()).toEqual(mockFactoring.fecha_operacion);
      expect(factoringliquidacionDao.insertFactoringliquidacion).toHaveBeenCalledTimes(1);
      expect(factoringliquidacionfinancieroDao.insertFactoringliquidacionfinanciero).toHaveBeenCalled();
    });
  });

  it("debe calcular descuento a favor cuando el pago se realiza antes o en la fecha estimada", async () => {
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as jest.Mock).mockResolvedValue({
      dias_pago_estimado: 25,
      monto_descuento: new Decimal(320), // 320 vs 400 original
    });

    const result = await simulateFactoringliquidacionService({
      factoringid: "factoring-uuid-1",
      fecha_liquidacion: new Date("2026-09-26T00:00:00.000Z"),
      fecha_pago_efectivo: new Date("2026-09-26T00:00:00.000Z"), // 5 días antes
    });

    expect(result.dias_mora_efectivo).toBe(0);
    expect(result.monto_descuento_mora.toNumber()).toBe(0);
    // Descuento a favor = 400 - 320 = 80
    expect(result.monto_descuento_a_favor.toNumber()).toBe(80);
    expect(result.monto_total_a_favor.toNumber()).toBeGreaterThan(0);
  });

  it("debe calcular descuento por mora cuando el pago se realiza después de la fecha estimada", async () => {
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as jest.Mock).mockResolvedValue({
      dias_pago_estimado: 40,
      monto_descuento: new Decimal(550), // 550 vs 400 original
    });

    const result = await simulateFactoringliquidacionService({
      factoringid: "factoring-uuid-1",
      fecha_liquidacion: new Date("2026-10-11T00:00:00.000Z"),
      fecha_pago_efectivo: new Date("2026-10-11T00:00:00.000Z"), // 10 días después
    });

    expect(result.dias_mora_efectivo).toBe(10);
    // Descuento por mora = 550 - 400 = 150
    expect(result.monto_descuento_mora.toNumber()).toBe(150);
    expect(result.monto_descuento_a_favor.toNumber()).toBe(0);
  });
});
