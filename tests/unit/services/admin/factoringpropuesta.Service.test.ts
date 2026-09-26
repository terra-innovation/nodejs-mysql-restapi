import { Decimal } from "@prisma/client/runtime/library";
import { ClientError } from "#src/utils/CustomErrors.js";

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

jest.mock("#root/src/daos/factoringtipo.Dao.js", () => ({
  getFactoringtipoByFactoringtipoid: jest.fn().mockResolvedValue({ idfactoringtipo: 1 }),
  getFactoringtipos: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/riesgo.Dao.js", () => ({
  getRiesgoByRiesgoid: jest.fn().mockResolvedValue({ idriesgo: 1 }),
  getRiesgos: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/factoringestrategia.Dao.js", () => ({
  getFactoringestrategiaByFactoringestrategiaid: jest.fn().mockResolvedValue({ idfactoringestrategia: 1 }),
  getFactoringestrategias: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/factoringpropuestaestado.Dao.js", () => ({
  getFactoringpropuestaestadoByFactoringpropuestaestadoid: jest.fn().mockResolvedValue({ idfactoringpropuestaestado: 1 }),
  getFactoringpropuestaestados: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/factoringpropuesta.Dao.js", () => ({
  getFactoringpropuestasByIdfactoring: jest.fn().mockResolvedValue([]),
  getFactoringpropuestaByFactoringpropuestaid: jest.fn(),
  insertFactoringpropuesta: jest.fn().mockResolvedValue({ idfactoringpropuesta: 100 }),
  activateFactoringpropuesta: jest.fn(),
  deleteFactoringpropuesta: jest.fn(),
  getFactoringpropuestas: jest.fn().mockResolvedValue([]),
}));

jest.mock("#root/src/daos/factoringpropuestahistorialestado.Dao.js", () => ({
  insertFactoringpropuestahistorialestado: jest.fn().mockResolvedValue({ idfactoringpropuestahistorialestado: 200 }),
}));

jest.mock("#root/src/daos/factoringpropuestafinanciero.Dao.js", () => ({
  insertFactoringpropuestafinanciero: jest.fn().mockResolvedValue({}),
}));

jest.mock("#root/src/daos/usuario.Dao.js", () => ({
  getUsuarioByEmail: jest.fn(),
}));

jest.mock("#root/src/providers/email/email.Provider.js", () => ({
  sendFactoringEmpresaServicioFactoringPropuestaDisponible: jest.fn(),
}));

jest.mock("#root/src/services/factoring.Service.js", () => ({
  simulateFactoringLogicV4: jest.fn(),
}));

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import { simulateFactoringLogicV4 } from "#root/src/services/factoring.Service.js";
import {
  activateFactoringpropuestaService,
  createFactoringpropuestaService,
  deleteFactoringpropuestaService,
  simulateFactoringpropuestaService,
} from "#root/src/services/admin/factoringpropuesta.Service.js";

describe("admin/factoringpropuesta.Service - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as jest.Mock).mockResolvedValue({
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
  });

  it("createFactoringpropuestaService debe persistir propuesta y su desglose", async () => {
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(mockFactoring);
    (simulateFactoringLogicV4 as jest.Mock).mockResolvedValue({
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
  });

  it("activateFactoringpropuestaService debe arrojar 404 si el registro no existe", async () => {
    (factoringpropuestaDao.activateFactoringpropuesta as jest.Mock).mockResolvedValue([0]);

    await expect(
      activateFactoringpropuestaService({ factoringpropuestaid: "uuid-inexistente" }, 1),
    ).rejects.toThrow(ClientError);
  });

  it("deleteFactoringpropuestaService debe arrojar 404 si el registro no existe", async () => {
    (factoringpropuestaDao.deleteFactoringpropuesta as jest.Mock).mockResolvedValue([0]);

    await expect(
      deleteFactoringpropuestaService({ factoringpropuestaid: "uuid-inexistente" }, 1),
    ).rejects.toThrow(ClientError);
  });
});
