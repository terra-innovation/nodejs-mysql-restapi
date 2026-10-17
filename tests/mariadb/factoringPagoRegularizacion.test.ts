import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, expect, it } from "vitest";
import { db, seedMasters, seedApproval, cleanFixtures } from "./businessSupport.js";
import { assertTestTarget, connect } from "../../scripts/integration/mariadb-common.mjs";

const sqlFile = await readFile(new URL("../../docs/pagos-factoring/regularizacion-maestros.sql", import.meta.url), "utf8");
const sourceBlock = sqlFile.slice(sqlFile.indexOf("BEGIN NOT ATOMIC"), sqlFile.lastIndexOf("END$$") + 3);
let block: string;
const target = assertTestTarget(process.env.FT_INTEGRATION_DATABASE_URL, process.env.FT_INTEGRATION_RUN_ID);
let connection: Awaited<ReturnType<typeof connect>>;
let user: Awaited<ReturnType<typeof seedMasters>>;
let operation: Awaited<ReturnType<typeof seedApproval>>["factoring"];
beforeEach(async () => {
  user = await seedMasters();
  const fixture = await seedApproval(user.idusuario);
  operation = await db.factoring.update({ where: { idfactoring: fixture.factoring.idfactoring }, data: { fecha_operacion: new Date("2026-10-01T00:00:00Z") } });
  connection = await connect(target);
  // Único ajuste de configuración: actor sintético, nunca el usuario real 105.
  block = sourceBlock.replace("DECLARE v_actor INT DEFAULT 105;", `DECLARE v_actor INT DEFAULT ${user.idusuario};`);
});
afterEach(async () => {
  await connection.end();
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_regularizacion_failure");
  await cleanFixtures();
});
afterAll(async () => {
  await db.$disconnect();
});
it("un solo bloque calcula candidatos y verifica el resultado sin parametros de sesion", async () => {
  const result = await connection.query(block);
  const summary = result.flat().find((row) => row.resultado === "APLICADO");
  expect(summary).toMatchObject({ base_destino: target.database, responsable: user.idusuario });
  for (const field of ["candidatos", "maestros_creados", "eventos_creados"]) expect(String(summary[field])).toBe("1");
  expect(String(summary.maestros_faltantes)).toBe("0");
  expect(summary.lote).toMatch(/^[\da-f-]{36}$/i);
  const history = await db.factoring_pago_historial.findFirstOrThrow();
  expect(JSON.parse(history.valores_posteriores!)).toMatchObject({ lote: summary.lote, estado: "PENDIENTE" });
});
it("rechaza catalogo pendiente inactivo sin crear maestros", async () => {
  await db.factoring_pago_estado.update({ where: { idfactoringpagoestado: 1 }, data: { estado: 2 } });
  await expect(connection.query(block)).rejects.toThrow("Catalogo PENDIENTE no disponible");
  expect(await db.factoring_pago.count()).toBe(0);
  expect(await db.factoring_pago_historial.count()).toBe(0);
});
async function clone(data: Partial<typeof operation> = {}) {
  const { idfactoring: _pk, factoringid: _uuid, code: _code, ...fields } = operation;
  return db.factoring.create({ data: { ...fields, code: randomUUID(), ...data } });
}
it("crea solo faltantes iniciados hasta el corte, preserva existentes y reintenta sin duplicar", async () => {
  const existingOp = await clone();
  const deletedMasterOp = await clone();
  await clone({ fecha_operacion: null });
  await clone({ estado: 2 });
  await clone({ fecha_operacion: new Date(Date.now() + 86400000) });
  const existing = await db.factoring_pago.create({ data: { code: randomUUID(), idfactoring: existingOp.idfactoring, idfactoringpagoestado: 3, version: 7, idusuariocrea: user.idusuario, idusuariomod: user.idusuario } });
  const deleted = await db.factoring_pago.create({ data: { code: randomUUID(), idfactoring: deletedMasterOp.idfactoring, idfactoringpagoestado: 2, estado: 2, idusuariocrea: user.idusuario, idusuariomod: user.idusuario } });
  const operationsBefore = await db.factoring.findMany({ orderBy: { idfactoring: "asc" } });
  await connection.query(block);
  const master = await db.factoring_pago.findUniqueOrThrow({ where: { idfactoring: operation.idfactoring } });
  expect(master).toMatchObject({ idfactoringpagoestado: 1, estado: 1, version: 1, idusuariocrea: user.idusuario, idusuariomod: user.idusuario });
  expect(await db.factoring_pago_historial.findMany()).toMatchObject([{ idfactoringpago: master.idfactoringpago, evento: "ALTA_REGULARIZACION", motivo: "REGULARIZACION_MAESTROS_PAGO_20261016", valores_anteriores: null }]);
  expect(await db.factoring_pago.findUnique({ where: { idfactoringpago: existing.idfactoringpago } })).toEqual(existing);
  expect(await db.factoring_pago.findUnique({ where: { idfactoringpago: deleted.idfactoringpago } })).toEqual(deleted);
  expect(await db.factoring.findMany({ orderBy: { idfactoring: "asc" } })).toEqual(operationsBefore);
  expect(await db.factoring_pago.count()).toBe(3);
  expect(await db.factoring_pago_detalle.count()).toBe(0);
  await connection.query(block);
  expect(await db.factoring_pago.count()).toBe(3);
  expect(await db.factoring_pago_historial.count()).toBe(1);
  expect(await db.factoring_pago.findUnique({ where: { idfactoring: operation.idfactoring } })).toEqual(master);
});
it("revierte maestros e historial ante fallo de auditoria", async () => {
  await db.$executeRawUnsafe("CREATE TRIGGER it_regularizacion_failure BEFORE INSERT ON factoring_pago_historial FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fallo sintetico'");
  await expect(connection.query(block)).rejects.toThrow("Fallo sintetico");
  expect(await db.factoring_pago.count()).toBe(0);
  expect(await db.factoring_pago_historial.count()).toBe(0);
});
it("revierte el lote si la verificacion detecta un evento sin su identificador de lote", async () => {
  await db.$executeRawUnsafe("CREATE TRIGGER it_regularizacion_failure BEFORE INSERT ON factoring_pago_historial FOR EACH ROW SET NEW.valores_posteriores=JSON_OBJECT('lote','otro')");
  await expect(connection.query(block)).rejects.toThrow("Verificacion inconsistente");
  expect(await db.factoring_pago.count()).toBe(0);
  expect(await db.factoring_pago_historial.count()).toBe(0);
});
it("rechaza responsable inactivo sin escribir", async () => {
  await db.usuario.update({ where: { idusuario: user.idusuario }, data: { estado: 2 } });
  await expect(connection.query(block)).rejects.toThrow("Responsable no activo");
  expect(await db.factoring_pago.count()).toBe(0);
});
it("rechaza una sesion con transaccion abierta sin revertirla", async () => {
  await connection.query("START TRANSACTION");
  await expect(connection.query(block)).rejects.toThrow("sesion dedicada");
  const [session] = await connection.query("SELECT @@in_transaction AS abierta");
  expect(session.abierta).toBe(1n);
  await connection.query("ROLLBACK");
  expect(await db.factoring_pago.count()).toBe(0);
});
