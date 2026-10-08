import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, cleanFixtures, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";
import type { TxClient } from "#src/types/Prisma.types.js";

vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringLiquidacion: vi.fn(), sendFactoringEmpresaServicioFactoringTransferencia: vi.fn() }));
import { createFactoringliquidacionService as liquidate } from "#src/services/admin/factoringliquidacion.Service.js";
import { createFactoringtransferenciacedenteService as transfer } from "#src/services/admin/factoringtransferenciacedente.Service.js";
import * as liquidationDao from "#src/daos/factoringliquidacion.Dao.js";
import * as transferDao from "#src/daos/factoringtransferenciacedente.Dao.js";

let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => { user = await seedMasters(); });
afterEach(async () => {
  vi.restoreAllMocks();
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_concurrent_failure");
  await cleanFixtures();
});
afterAll(async () => { await db.$disconnect(); });

// Pausa después de INSERT real y antes de detalles/constancia; no simula resultados.
// La liberación y el drenaje de solicitudes ocurren siempre en finally.
function headersGate() {
  const releases = new Map<string, () => void>();
  const connections = new Set<string>();
  let released = false;
  let both!: () => void;
  const ready = new Promise<void>(resolve => { both = resolve; });
  return {
    connections,
    async hold(key: string, tx: TxClient) {
      const [row] = await tx.$queryRaw<Array<{ id: bigint }>>`SELECT CONNECTION_ID() AS id`;
      connections.add(String(row.id));
      if (released) return;
      await new Promise<void>(resolve => {
        if (releases.has(key)) throw new Error("Identidad repetida en el coordinador de pruebas");
        releases.set(key, resolve);
        if (releases.size === 2) both();
      });
    },
    async wait() {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([ready, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Las dos solicitudes no alcanzaron INSERT")), 5000); })]);
      } finally { clearTimeout(timer); }
    },
    release(key: string) { releases.get(key)?.(); },
    releaseAll() { released = true; for (const release of releases.values()) release(); },
  };
}
async function assertLiquidations(expected: number) {
  const rows = await db.factoring_liquidacion.findMany({ include: { factoring_liquidacion_financieros: { include: { financiero_concepto: true } } } });
  expect(rows).toHaveLength(expected);
  expect(new Set(rows.map(row => row.factoringliquidacionid)).size).toBe(expected);
  expect(await db.factoring_liquidacion_financiero.count()).toBe(expected * 2);
  for (const row of rows) {
    expect(row.monto_total_a_favor.toString()).toBe("3614.85");
    expect(row.monto_total_por_cobrar.toString()).toBe("0");
    expect(row.factoring_liquidacion_financieros).toHaveLength(2);
    expect(row.factoring_liquidacion_financieros.map(item => item.idfinancieroconcepto).sort()).toEqual([7, 9]);
    const sum = row.factoring_liquidacion_financieros.reduce((acc, item) => {
      expect(item.idfactoringliquidacion).toBe(row.idfactoringliquidacion);
      expect(item.total.equals(item.monto.plus(item.igv))).toBe(true);
      return acc.plus(item.total.mul(item.financiero_concepto.factor));
    }, row.monto_total_a_favor.mul(0));
    expect(sum.equals(row.monto_total_a_favor)).toBe(true);
  }
  return rows;
}
async function assertTransfers(expected: number, idarchivo: number) {
  const rows = await db.factoring_transferencia_cedente.findMany();
  const links = await db.archivo_factoring_transferencia_cedente.findMany();
  expect(rows).toHaveLength(expected); expect(links).toHaveLength(expected);
  expect(new Set(rows.map(row => row.factoringtransferenciacedenteid)).size).toBe(expected);
  for (const row of rows) {
    expect(row.monto.toString()).toBe("4000.15");
    expect(links.filter(link => link.idfactoringtransferenciacedente === row.idfactoringtransferenciacedente)).toHaveLength(1);
  }
  for (const link of links) expect(link.idarchivo).toBe(idarchivo);
  expect(await db.archivo.count()).toBe(1);
  return rows;
}

describe("Caracterización de solicitudes repetidas; no establece idempotencia comercial", () => {
  it.each(["PEN", "USD"])("liquidación %s: repetir el mismo payload guarda dos registros completos", async currency => {
    const f = await seedSettlement(user.idusuario, currency);
    const dto = { ...f.liquidacionDto, fecha_pago_efectivo: "2026-10-31T05:00:00Z" };
    await liquidate(dto, user.idusuario); await liquidate(dto, user.idusuario);
    await assertLiquidations(2);
  });
  it.each(["PEN", "USD"])("transferencia %s: repetir número de operación y constancia guarda dos registros", async currency => {
    const f = await seedSettlement(user.idusuario, currency);
    await transfer(f.transferenciaDto, user.idusuario); await transfer(f.transferenciaDto, user.idusuario);
    const rows = await assertTransfers(2, f.archivo.idarchivo);
    expect(rows.map(row => row.numero_operacion)).toEqual(["IT-OPERACION", "IT-OPERACION"]);
  });
});

describe("Creaciones concurrentes completas", () => {
  it("liquidaciones simultáneas sin coordinación guardan dos registros independientes", async () => {
    const f = await seedSettlement(user.idusuario);
    const dto = { ...f.liquidacionDto, fecha_pago_efectivo: "2026-10-31T05:00:00Z" };
    await Promise.all([liquidate(dto, user.idusuario), liquidate(dto, user.idusuario)]);
    await assertLiquidations(2);
  });
  it("transferencias simultáneas sin coordinación repiten la operación y vinculan ambas constancias", async () => {
    const f = await seedSettlement(user.idusuario);
    await Promise.all([transfer(f.transferenciaDto, user.idusuario), transfer(f.transferenciaDto, user.idusuario)]);
    await assertTransfers(2, f.archivo.idarchivo);
  });
  it("dos liquidaciones insertadas sin commit en conexiones distintas terminan con todos sus detalles", async () => {
    const f = await seedSettlement(user.idusuario); const gate = headersGate();
    const original = liquidationDao.insertFactoringliquidacion;
    vi.spyOn(liquidationDao, "insertFactoringliquidacion").mockImplementation(async (...args) => {
      const row = await original(...args); await gate.hold(row.factoringliquidacionid, args[0]); return row;
    });
    const dto = { ...f.liquidacionDto, fecha_pago_efectivo: "2026-10-31T05:00:00Z" };
    const done = Promise.allSettled([liquidate(dto, user.idusuario), liquidate(dto, user.idusuario)]);
    try {
      await gate.wait(); expect(gate.connections.size).toBe(2);
      expect(await db.factoring_liquidacion.count()).toBe(0);
      gate.releaseAll(); expect((await done).map(result => result.status)).toEqual(["fulfilled", "fulfilled"]);
      await assertLiquidations(2);
    } finally { gate.releaseAll(); await done; }
  });
  it("dos transferencias insertadas sin commit en conexiones distintas conservan sus vínculos", async () => {
    const f = await seedSettlement(user.idusuario); const gate = headersGate();
    const original = transferDao.insertFactoringtransferenciacedente;
    vi.spyOn(transferDao, "insertFactoringtransferenciacedente").mockImplementation(async (...args) => {
      const row = await original(...args); await gate.hold(row.factoringtransferenciacedenteid, args[0]); return row;
    });
    const done = Promise.allSettled([transfer(f.transferenciaDto, user.idusuario), transfer(f.transferenciaDto, user.idusuario)]);
    try {
      await gate.wait(); expect(gate.connections.size).toBe(2);
      expect(await db.factoring_transferencia_cedente.count()).toBe(0);
      gate.releaseAll(); expect((await done).map(result => result.status)).toEqual(["fulfilled", "fulfilled"]);
      await assertTransfers(2, f.archivo.idarchivo);
    } finally { gate.releaseAll(); await done; }
  });
});

describe("Rollback aislado de una solicitud concurrente", () => {
  it.each(["fallo primero", "éxito primero"])("liquidación: %s; error en segundo detalle no afecta a la otra solicitud", async order => {
    const f = await seedSettlement(user.idusuario); const gate = headersGate();
    await db.$executeRawUnsafe("CREATE TRIGGER it_concurrent_failure BEFORE INSERT ON factoring_liquidacion_financiero FOR EACH ROW BEGIN IF NEW.orden=2 AND (SELECT DAYOFMONTH(fecha_liquidacion) FROM factoring_liquidacion WHERE _idfactoringliquidacion=NEW._idfactoringliquidacion)=2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'; END IF; END");
    const original = liquidationDao.insertFactoringliquidacion;
    vi.spyOn(liquidationDao, "insertFactoringliquidacion").mockImplementation(async (...args) => {
      const row = await original(...args); await gate.hold(row.fecha_liquidacion.getUTCDate() === 2 ? "failure" : "success", args[0]); return row;
    });
    const dto = { ...f.liquidacionDto, fecha_pago_efectivo: "2026-10-31T05:00:00Z" };
    const failure = Promise.allSettled([liquidate({ ...dto, fecha_liquidacion: "2026-10-02T05:00:00Z" }, user.idusuario)]);
    const success = Promise.allSettled([liquidate(dto, user.idusuario)]);
    const done = Promise.all([failure, success]);
    try {
      await gate.wait(); expect(gate.connections.size).toBe(2);
      const firstFails = order === "fallo primero";
      gate.release(firstFails ? "failure" : "success");
      await (firstFails ? failure : success);
      gate.release(firstFails ? "success" : "failure");
      const [[failed], [completed]] = await done;
      expect(failed).toMatchObject({ status: "rejected", reason: { statusCode: 500 } }); expect(completed.status).toBe("fulfilled");
      const rows = await assertLiquidations(1);
      expect(rows[0].fecha_liquidacion).toEqual(new Date(dto.fecha_liquidacion));
    } finally { gate.releaseAll(); await done; }
  });
  it.each(["fallo primero", "éxito primero"])("transferencia: %s; error en constancia no afecta a la otra solicitud", async order => {
    const f = await seedSettlement(user.idusuario); const gate = headersGate();
    await db.$executeRawUnsafe("CREATE TRIGGER it_concurrent_failure BEFORE INSERT ON archivo_factoring_transferencia_cedente FOR EACH ROW BEGIN IF (SELECT numero_operacion FROM factoring_transferencia_cedente WHERE _idfactoringtransferenciacedente=NEW._idfactoringtransferenciacedente)='IT-FAILURE' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'; END IF; END");
    const original = transferDao.insertFactoringtransferenciacedente;
    vi.spyOn(transferDao, "insertFactoringtransferenciacedente").mockImplementation(async (...args) => {
      const row = await original(...args); await gate.hold(row.numero_operacion === "IT-FAILURE" ? "failure" : "success", args[0]); return row;
    });
    const failure = Promise.allSettled([transfer({ ...f.transferenciaDto, numero_operacion: "IT-FAILURE" }, user.idusuario)]);
    const success = Promise.allSettled([transfer(f.transferenciaDto, user.idusuario)]);
    const done = Promise.all([failure, success]);
    try {
      await gate.wait(); expect(gate.connections.size).toBe(2);
      const firstFails = order === "fallo primero";
      gate.release(firstFails ? "failure" : "success");
      await (firstFails ? failure : success);
      gate.release(firstFails ? "success" : "failure");
      const [[failed], [completed]] = await done;
      expect(failed).toMatchObject({ status: "rejected", reason: { statusCode: 500 } }); expect(completed.status).toBe("fulfilled");
      const rows = await assertTransfers(1, f.archivo.idarchivo);
      expect(rows[0].numero_operacion).toBe("IT-OPERACION");
    } finally { gate.releaseAll(); await done; }
  });
});
