import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";
import { ClientError } from "#src/utils/CustomErrors.js";

// Mocking prismaFT
vi.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: {
    client: {
      $transaction: vi.fn(async (cb) => cb({})),
    },
    transactionTimeout: 5000,
  },
}));

// Mocking DAOs
vi.mock("#root/src/daos/factoring.Dao.js", () => ({
  getFactoringByFactoringid: vi.fn(),
  getFactoringByIdfactoring: vi.fn(),
}));

vi.mock("#root/src/daos/factoringtipo.Dao.js", () => ({
  getFactoringtipoByFactoringtipoid: vi.fn().mockResolvedValue({ idfactoringtipo: 1 }),
  getFactoringtipos: vi.fn().mockResolvedValue([]),
}));

vi.mock("#root/src/daos/riesgo.Dao.js", () => ({
  getRiesgoByRiesgoid: vi.fn().mockResolvedValue({ idriesgo: 1 }),
  getRiesgos: vi.fn().mockResolvedValue([]),
}));

vi.mock("#root/src/daos/factoringestrategia.Dao.js", () => ({
  getFactoringestrategiaByFactoringestrategiaid: vi.fn().mockResolvedValue({ idfactoringestrategia: 1 }),
  getFactoringestrategias: vi.fn().mockResolvedValue([]),
}));

vi.mock("#root/src/daos/factoringpropuestaestado.Dao.js", () => ({
  getFactoringpropuestaestadoByFactoringpropuestaestadoid: vi.fn().mockResolvedValue({ idfactoringpropuestaestado: 1 }),
  getFactoringpropuestaestados: vi.fn().mockResolvedValue([]),
}));

vi.mock("#root/src/daos/factoringpropuesta.Dao.js", () => ({
  getFactoringpropuestasByIdfactoring: vi.fn().mockResolvedValue([]),
  getFactoringpropuestaByFactoringpropuestaid: vi.fn(),
  insertFactoringpropuesta: vi.fn().mockResolvedValue({ idfactoringpropuesta: 100 }),
  activateFactoringpropuesta: vi.fn(),
  deleteFactoringpropuesta: vi.fn(),
  getFactoringpropuestas: vi.fn().mockResolvedValue([]),
}));

vi.mock("#root/src/daos/factoringpropuestahistorialestado.Dao.js", () => ({
  insertFactoringpropuestahistorialestado: vi.fn().mockResolvedValue({ idfactoringpropuestahistorialestado: 200 }),
}));

vi.mock("#root/src/daos/factoringpropuestafinanciero.Dao.js", () => ({
  insertFactoringpropuestafinanciero: vi.fn().mockResolvedValue({}),
}));

vi.mock("#root/src/daos/usuario.Dao.js", () => ({
  getUsuarioByEmail: vi.fn(),
}));

vi.mock("#root/src/providers/email/email.Provider.js", () => ({
  sendFactoringEmpresaServicioFactoringPropuestaDisponible: vi.fn(),
}));

vi.mock("#root/src/services/admin/factoringCalculation.Service.js", () => ({
  simulateFactoringLogicV4: vi.fn(),
}));

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import { simulateFactoringLogicV4 } from "#root/src/services/admin/factoringCalculation.Service.js";
import { activateFactoringpropuestaService, createFactoringpropuestaService, deleteFactoringpropuestaService, simulateFactoringpropuestaService } from "#root/src/services/admin/factoringpropuesta.Service.js";

describe("admin/factoringpropuesta.Service - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFactoring = {
    idfactoring: 10,
    monto_neto: new Decimal(10000),
    cantidad_facturas: 1,
    fecha_operacion: new Date("2026-09-01T00:00:00.000Z"),
    fecha_emision: new Date("2026-08-01T00:00:00.000Z"),
    cuenta_bancaria: { idbanco: 1 },
    moneda: { idmoneda: 1 },
  };

  it("simulateFactoringpropuestaService debe ejecutar la simulación delegando a simulateFactoringLogicV4", async () => {
    (factoringDao.getFactoringByFactoringid as Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as Mock).mockResolvedValue({
      tda: new Decimal(0.26),
      tdm: new Decimal(0.02),
      monto_efectivo: new Decimal(8000),
      monto_garantia: new Decimal(2000),
    });

    const result = await simulateFactoringpropuestaService({
      factoringid: "factoring-uuid-1",
      factoringtipoid: "tipo-uuid-1",
      riesgooperacionid: "riesgo-uuid-1",
      factoringestrategiaid: "estrategia-uuid-1",
      tdm: 0.02,
      porcentaje_financiado_estimado: 0.8,
      porcentaje_comision_descuento: 0,
      fecha_pago_estimado: new Date("2026-10-01T00:00:00.000Z"),
      monto_neto: 10000,
    });

    expect(result.monto_efectivo?.toNumber()).toBe(8000);
    expect(result.monto_garantia?.toNumber()).toBe(2000);
    expect(simulateFactoringLogicV4).toHaveBeenCalled();
    const fechaFin = (simulateFactoringLogicV4 as Mock).mock.calls[0][5];
    expect(fechaFin.zoneName).toBe("America/Lima");
    expect(fechaFin.toISODate()).toBe("2026-09-30");
    expect(fechaFin.toJSDate()).toEqual(new Date("2026-10-01T00:00:00.000Z"));
  });

  it.each(
    [
      ["2026-10-01T05:00:00.000Z", "2026-10-01"],
      [new Date("2026-10-01T05:00:00.000Z"), "2026-10-01"],
      ["2026-10-01T00:00:00.000Z", "2026-09-30"],
      [new Date("2026-10-01T00:00:00.000Z"), "2026-09-30"],
    ].map(([fecha_pago_estimado, fechaPeru]) => ({
      label: typeof fecha_pago_estimado === "string" ? JSON.stringify(fecha_pago_estimado) : fecha_pago_estimado.toISOString(),
      fecha_pago_estimado,
      fechaPeru,
    })),
  )("interpreta el vencimiento $label en Perú sin alterar su instante", async ({ fecha_pago_estimado, fechaPeru }) => {
    (factoringDao.getFactoringByFactoringid as Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as Mock).mockResolvedValue({});
    await simulateFactoringpropuestaService({
      factoringid: "factoring-uuid-1",
      factoringtipoid: "tipo-uuid-1",
      riesgooperacionid: "riesgo-uuid-1",
      factoringestrategiaid: "estrategia-uuid-1",
      tdm: 0.02,
      porcentaje_financiado_estimado: 0.8,
      porcentaje_comision_descuento: 0,
      fecha_pago_estimado,
      monto_neto: 10000,
    });
    const fechaFin = (simulateFactoringLogicV4 as Mock).mock.calls[0][5];
    expect(fechaFin.zoneName).toBe("America/Lima");
    expect(fechaFin.toISODate()).toBe(fechaPeru);
    expect(fechaFin.toJSDate()).toEqual(new Date(fecha_pago_estimado));
  });

  it("createFactoringpropuestaService debe persistir propuesta y su desglose", async () => {
    (factoringDao.getFactoringByFactoringid as Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as Mock).mockResolvedValue({
      tda: new Decimal(0.26),
      tdm: new Decimal(0.02),
      monto_efectivo: new Decimal(8000),
      monto_garantia: new Decimal(2000),
      comisiones: [
        {
          financiero_tipo: { idfinancierotipo: 1 },
          financiero_concepto: { idfinancieroconcepto: 1 },
          cantidad: 1,
          monto_unitario: new Decimal(100),
          monto: new Decimal(100),
          igv: new Decimal(18),
          total: new Decimal(118),
          porcentaje_monto: new Decimal(0.01),
        },
      ],
    });

    const result = await createFactoringpropuestaService(
      {
        factoringid: "factoring-uuid-1",
        factoringtipoid: "tipo-uuid-1",
        riesgooperacionid: "riesgo-uuid-1",
        riesgocedenteid: "riesgo-uuid-2",
        riesgoaceptanteid: "riesgo-uuid-3",
        factoringpropuestaestadoid: "estado-uuid-1",
        factoringestrategiaid: "estrategia-uuid-1",
        tdm: 0.02,
        porcentaje_financiado_estimado: 0.8,
        porcentaje_comision_descuento: 0,
        fecha_pago_estimado: new Date("2026-10-01T00:00:00.000Z"),
        monto_neto: 10000,
      },
      7,
    );

    expect(result.monto_efectivo?.toNumber()).toBe(8000);
    expect(factoringpropuestaDao.insertFactoringpropuesta).toHaveBeenCalled();
    const fechaFin = (simulateFactoringLogicV4 as Mock).mock.calls[0][5];
    expect(fechaFin.zoneName).toBe("America/Lima");
    expect(fechaFin.toISODate()).toBe("2026-09-30");
    expect((factoringpropuestaDao.insertFactoringpropuesta as Mock).mock.calls[0][1].fecha_pago_estimado).toEqual(new Date("2026-10-01T00:00:00.000Z"));
  });

  it("activateFactoringpropuestaService debe arrojar 404 si el registro no existe", async () => {
    (factoringpropuestaDao.activateFactoringpropuesta as Mock).mockResolvedValue([0]);

    await expect(activateFactoringpropuestaService({ factoringpropuestaid: "uuid-inexistente" }, 1)).rejects.toThrow(ClientError);
  });

  it("deleteFactoringpropuestaService debe arrojar 404 si el registro no existe", async () => {
    (factoringpropuestaDao.deleteFactoringpropuesta as Mock).mockResolvedValue([0]);

    await expect(deleteFactoringpropuestaService({ factoringpropuestaid: "uuid-inexistente" }, 1)).rejects.toThrow(ClientError);
  });
});
