import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Settings } from "luxon";
import { db, cleanFixtures, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";

const boundary = vi.hoisted(() => ({ email: vi.fn(), telegram: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringPropuestaAceptada: boundary.email }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: boundary.telegram }));
import { createFactoringpropuestaService as create, simulateFactoringpropuestaService as simulate, getFactoringpropuestasByFactoringidService as list } from "#src/services/admin/factoringpropuesta.Service.js";
import { acceptFactoringpropuestaService as accept } from "#src/services/empresario/factoringpropuesta.Service.js";
import * as strategyDao from "#src/daos/factoringestrategia.Dao.js";
import * as configDao from "#src/daos/configuracionapp.Dao.js";
import { createFactoringsimulacionService } from "#src/services/admin/factoringsimulacion.Service.js";

let user: Awaited<ReturnType<typeof seedMasters>>;
const originalNow = Settings.now;
beforeEach(async () => {
  vi.clearAllMocks(); boundary.email.mockResolvedValue(undefined);
  Settings.now = () => Date.parse("2026-09-01T05:00:00Z");
  user = await seedMasters();
});
afterEach(async () => {
  Settings.now = originalNow; vi.restoreAllMocks();
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_proposal_failure"); await cleanFixtures();
});
afterAll(async () => { await db.$disconnect(); });

async function arrange(currency = "PEN", bank = 1) {
  const f = await seedSettlement(user.idusuario, currency, bank);
  const tipo = await db.factoring_tipo.create({ data: { nombre: "Prueba", alias: "IT", color: "blue" } });
  const estrategia = await db.factoring_estrategia.create({ data: { idfactoringestrategia: 1, code: "IT", nombre_estrategia: "Sintetica" } });
  const riesgo = await db.riesgo.findFirstOrThrow();
  const estado = await db.factoring_propuesta_estado.findUniqueOrThrow({ where: { idfactoringpropuestaestado: 4 } });
  const dto = { factoringid: f.factoring.factoringid, factoringtipoid: tipo.factoringtipoid, factoringestrategiaid: estrategia.factoringestrategiaid, riesgooperacionid: riesgo.riesgoid, riesgocedenteid: riesgo.riesgoid, riesgoaceptanteid: riesgo.riesgoid, factoringpropuestaestadoid: estado.factoringpropuestaestadoid, monto_neto: 20000, porcentaje_financiado_estimado: 0.8, porcentaje_comision_descuento: 0, tdm: 0.02, fecha_pago_estimado: "2026-10-01T05:00:00Z" };
  return { ...f, dto };
}
async function snapshot() {
  return { proposals: await db.factoring_propuesta.findMany({ orderBy: { idfactoringpropuesta: "asc" } }), histories: await db.factoring_propuesta_historial_estado.findMany(), details: await db.factoring_propuesta_financiero.findMany(), operations: await db.factoring.findMany() };
}

describe("Cálculo y creación de propuestas con Prisma/MariaDB reales", () => {
  it("DT-LIQ-04: guarda financiamiento más garantía igual al neto con centavo impar", async () => {
    const f = await arrange();
    const dto = { ...f.dto, monto_neto: 100.01, porcentaje_financiado_estimado: 0.5, tdm: 0 };
    const simulated = await simulate(dto);
    await create(dto, user.idusuario);
    const stored = await db.factoring_propuesta.findFirstOrThrow({ where: { idfactoring: f.factoring.idfactoring, idfactoringpropuesta: { not: f.propuesta.idfactoringpropuesta } } });
    expect(stored.monto_financiado!.toString()).toBe("50.01");
    expect(stored.monto_garantia!.toString()).toBe("50");
    expect(stored.monto_financiado!.plus(stored.monto_garantia!).equals(stored.monto_neto)).toBe(true);
    expect(stored.monto_garantia!.equals(simulated.monto_garantia!)).toBe(true);
  });
  it.each([0.8, 1])("DT-LIQ-05: guarda y lee simulación con cobertura null y financiamiento %s", async (porcentaje_financiado_estimado) => {
    const f = await arrange();
    const banco = await db.banco.findUniqueOrThrow({ where: { idbanco: 1 } });
    const moneda = await db.moneda.findFirstOrThrow({ where: { codigo: "PEN" } });
    await createFactoringsimulacionService(user.idusuario, {
      bancoid: banco.bancoid, monedaid: moneda.monedaid, factoringtipoid: f.dto.factoringtipoid, riesgooperacionid: f.dto.riesgooperacionid, factoringestrategiaid: f.dto.factoringestrategiaid,
      tdm: 0, porcentaje_financiado_estimado, porcentaje_comision_descuento: 0, monto_neto: 20000, cantidad_facturas: 2,
      fecha_emision: "2026-09-01T00:00:00Z", fecha_pago_estimado: f.dto.fecha_pago_estimado,
      ruc_cedente: "20111111111", ruc_aceptante: "20222222222", razon_social_cedente: "Cedente sintetico", razon_social_aceptante: "Aceptante sintetico",
    });
    const stored = await db.factoring_simulacion.findFirstOrThrow();
    expect(stored.dias_cobertura_garantia_estimado).toBeNull();
    expect(stored.monto_descuento!.toString()).toBe("0");
  });
  it.each([0.8, 1])("DT-LIQ-05: guarda y lee cobertura null con tasa cero y financiamiento %s", async (porcentaje_financiado_estimado) => {
    const f = await arrange();
    const dto = { ...f.dto, tdm: 0, porcentaje_financiado_estimado };
    const simulated = await simulate(dto);
    expect(simulated.dias_cobertura_garantia_estimado).toBeNull();
    await create(dto, user.idusuario);
    const stored = await db.factoring_propuesta.findFirstOrThrow({ where: { idfactoringpropuesta: { not: f.propuesta.idfactoringpropuesta } } });
    expect(stored.dias_cobertura_garantia_estimado).toBeNull();
    expect(stored.monto_descuento!.toString()).toBe("0");
    expect(stored.monto_dia_interes_estimado!.toString()).toBe("0");
  });
  for (const currency of ["PEN", "USD"]) for (const bank of [1, 2]) it(`${currency}, banco ${bank}: simula sin escrituras y guarda cabecera, historial y detalles conciliados`, async () => {
    const f = await arrange(currency, bank);
    const before = await snapshot();
    const simulated = await simulate(f.dto);
    expect(await snapshot()).toEqual(before);
    const created = await create(f.dto, user.idusuario);
    const stored = await db.factoring_propuesta.findFirstOrThrow({ where: { idfactoringpropuesta: { not: f.propuesta.idfactoringpropuesta } }, include: { factoring_propuesta_financieros: true, factoring_propuesta_historial_estados: true } });
    const cost = currency === "PEN" ? "15" : "5";
    const fee = bank === 1 ? "0" : currency === "PEN" ? "7.5" : "2.5";
    expect([stored.monto_neto, stored.monto_financiado, stored.monto_garantia, stored.monto_descuento, stored.monto_comision, stored.monto_comision_igv, stored.monto_costo_estimado, stored.monto_gasto_excento_igv].map(value => value!.toString())).toEqual(["20000", "16000", "4000", "320", "200", "36", cost, fee]);
    expect(stored.monto_adelanto!.toString()).toBe(currency === "PEN" ? bank === 1 ? "15426.3" : "15418.8" : bank === 1 ? "15438.1" : "15435.6");
    expect(stored.monto_adelanto!.equals(created.monto_adelanto!)).toBe(true);
    expect(stored.monto_descuento!.equals(simulated.monto_descuento!)).toBe(true);
    expect(stored).toMatchObject({ fecha_pago_estimado: new Date(f.dto.fecha_pago_estimado), dias_pago_estimado: 30, idusuariocrea: user.idusuario, idusuariomod: user.idusuario, idfactoringpropuestaestado: 4 });
    const details = stored.factoring_propuesta_financieros;
    expect(details).toHaveLength(bank === 1 ? 2 : 3);
    for (const detail of details) { expect(detail.total.equals(detail.monto.plus(detail.igv))).toBe(true); expect(detail.idusuariocrea).toBe(user.idusuario); }
    const costDetail = details.find(item => item.idfinancierotipo === 2)!;
    expect(costDetail.monto.toString()).toBe(cost);
    expect(details.filter(item => item.idfinancierotipo !== 4).reduce((sum, item) => sum.plus(item.igv), stored.monto_total_igv!.mul(0)).equals(stored.monto_total_igv!)).toBe(true);
    expect(stored.factoring_propuesta_historial_estados).toHaveLength(1);
    expect(stored.factoring_propuesta_historial_estados[0]).toMatchObject({ idfactoringpropuestaestado: 4, idusuariomodifica: user.idusuario });
    expect(await list({ factoringid: f.dto.factoringid })).toHaveLength(2);
    expect(await db.factoring.findMany()).toEqual(before.operations);
    expect(await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } })).toEqual(before.proposals[0]);
  });

  it.each(["factoringid", "factoringtipoid", "factoringestrategiaid", "riesgooperacionid", "riesgocedenteid", "riesgoaceptanteid", "factoringpropuestaestadoid"] as const)("referencia %s inexistente no altera propuestas previas", async field => {
    const f = await arrange(); const before = await snapshot();
    await expect(create({ ...f.dto, [field]: "inexistente" }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
    expect(await snapshot()).toEqual(before);
  });
  it.each(["cabecera", "historial", "primer detalle", "segundo detalle"])("fallo SQL en %s revierte la propuesta nueva y preserva la anterior", async stage => {
    const f = await arrange(); const before = await snapshot();
    const table = stage === "cabecera" ? "factoring_propuesta" : stage === "historial" ? "factoring_propuesta_historial_estado" : "factoring_propuesta_financiero";
    const statement = stage === "segundo detalle" ? "IF NEW._idfinancieroconcepto=2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'; END IF;" : "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure';";
    await db.$executeRawUnsafe(`CREATE TRIGGER it_proposal_failure BEFORE INSERT ON ${table} FOR EACH ROW BEGIN ${statement} END`);
    await expect(create(f.dto, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await snapshot()).toEqual(before);
  });
  it("fallo de lectura en la transacción del calculador no deja escrituras", async () => {
    const f = await arrange(); const before = await snapshot();
    await db.configuracion_app.delete({ where: { idconfiguracionapp: 1 } });
    await expect(create(f.dto, user.idusuario)).rejects.toThrow();
    expect(await snapshot()).toEqual(before);
  });
});

describe("Aislamiento y concurrencia: caracterización del comportamiento actual", () => {
  it("la transacción del calculador usa otra conexión y puede leer configuración posterior al snapshot exterior", async () => {
    const f = await arrange();
    let outerId = ""; let innerId = ""; let outerIGV = "";
    const strategy = strategyDao.getFactoringestrategiaByFactoringestrategiaid;
    vi.spyOn(strategyDao, "getFactoringestrategiaByFactoringestrategiaid").mockImplementationOnce(async (...args) => {
      const row = await strategy(...args);
      const [id] = await args[0].$queryRaw<Array<{ id: bigint }>>`SELECT CONNECTION_ID() AS id`;
      outerId = String(id.id);
      outerIGV = (await args[0].configuracion_app.findUniqueOrThrow({ where: { idconfiguracionapp: 1 } })).valor;
      await db.configuracion_app.update({ where: { idconfiguracionapp: 1 }, data: { valor: "0.20" } });
      return row;
    });
    const getIGV = configDao.getIGV;
    vi.spyOn(configDao, "getIGV").mockImplementation(async tx => {
      const [id] = await tx.$queryRaw<Array<{ id: bigint }>>`SELECT CONNECTION_ID() AS id`;
      innerId = String(id.id); return getIGV(tx);
    });
    await create(f.dto, user.idusuario);
    expect(outerId).not.toBe(innerId); expect(outerIGV).toBe("0.18");
    const saved = await db.factoring_propuesta.findFirstOrThrow({ where: { idfactoringpropuesta: { not: f.propuesta.idfactoringpropuesta } } });
    expect(saved.monto_comision_igv!.toString()).toBe("40");
    expect(saved.monto_total_igv!.toString()).toBe("43");
  });
  it("dos creaciones simultáneas guardan propuestas independientes y detalles completos sin reemplazar la aceptada", async () => {
    const f = await arrange();
    await Promise.all([create(f.dto, user.idusuario), create({ ...f.dto, monto_neto: 10000 }, user.idusuario)]);
    const rows = await db.factoring_propuesta.findMany({ where: { idfactoringpropuesta: { not: f.propuesta.idfactoringpropuesta } }, include: { factoring_propuesta_financieros: true, factoring_propuesta_historial_estados: true } });
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.factoring_propuesta_financieros).toHaveLength(2); expect(row.factoring_propuesta_historial_estados).toHaveLength(1);
      expect(row.monto_financiado!.equals(row.monto_neto.mul("0.8"))).toBe(true);
      expect(row.monto_descuento!.equals(row.monto_financiado!.mul("0.02"))).toBe(true);
    }
    expect((await db.factoring.findFirstOrThrow()).idfactoringpropuestaaceptada).toBe(f.propuesta.idfactoringpropuesta);
  });
  it("una aprobación entre lectura y creación conserva el vínculo e importes aprobados; la creación aún se permite", async () => {
    const f = await arrange();
    await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idfactoringpropuestaaceptada: null } });
    const old = await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } });
    const strategy = strategyDao.getFactoringestrategiaByFactoringestrategiaid;
    vi.spyOn(strategyDao, "getFactoringestrategiaByFactoringestrategiaid").mockImplementationOnce(async (...args) => {
      const row = await strategy(...args);
      await accept({ factoringid: f.dto.factoringid, factoringpropuestaid: f.propuesta.factoringpropuestaid, idusuario: user.idusuario });
      return row;
    });
    await create({ ...f.dto, monto_neto: 10000 }, user.idusuario);
    const operation = await db.factoring.findFirstOrThrow();
    const approved = await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } });
    expect(operation).toMatchObject({ idfactoringestado: 4, idfactoringpropuestaaceptada: approved.idfactoringpropuesta });
    expect(approved.idfactoringpropuestaestado).toBe(6);
    expect(approved.monto_neto.equals(old.monto_neto)).toBe(true); expect(approved.monto_descuento!.equals(old.monto_descuento!)).toBe(true);
    expect(await db.factoring_propuesta.count()).toBe(2); expect(await db.factoring_propuesta_financiero.count()).toBe(2);
    expect(boundary.email).toHaveBeenCalledTimes(1);
  });
});
