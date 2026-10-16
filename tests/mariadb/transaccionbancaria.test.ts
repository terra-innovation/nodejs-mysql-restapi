import { beforeAll, beforeEach, afterEach, afterAll, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { db, seedMasters, cleanFixtures } from "./businessSupport.js";
import { splitSql } from "../../scripts/database/maintenance-core.mjs";
const b = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: { PRISMA_DATABASE_FACTORING_URL: process.env.FT_INTEGRATION_DATABASE_URL }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/integrations/banca/mysqlSource.js", () => ({ readSource: b.read, sourceOptions: vi.fn().mockResolvedValue({}), testSource: vi.fn().mockResolvedValue({ correcto: true }) }));
import * as service from "#src/services/banca/transaccionbancaria.Service.js";
import * as configService from "#src/services/admin/configuracionbbdd.Service.js";
import { descifrarPassword } from "#src/providers/bbdd/bbddCrypto.js";

// businessSupport verifica localhost, marcador y UUID del contenedor antes de obtener el cliente.
// El origen MySQL se sustituye por filas sintéticas; persistencia, FKs, CHECK, transacciones y locks son reales.
let user: Awaited<ReturnType<typeof seedMasters>>, account: string, connection: string;
const source = { cuenta: "PEN-A", numerooperacion: "00001", fecha: "2026-10-15", descripcion: "Transferencia sintética", sumaoresta: "Resta", moneda: "PEN", monto: "-100.25" };
beforeAll(async () => {
  const sql = await readFile(new URL("../../docs/transacciones-bancarias/esquema-vigente.sql", import.meta.url), "utf8");
  for (const statement of splitSql(sql)) await db.$executeRawUnsafe(statement);
});
beforeEach(async () => {
  vi.stubEnv("BANK_SYNC_KEYS", JSON.stringify({ v1: randomBytes(32).toString("base64") }));
  vi.stubEnv("BANK_SYNC_ACTIVE_KEY", "v1");
  user = await seedMasters();
  await db.factor.create({ data: { idfactor: 1, code: "IT-FACTOR", ruc: "20000000009", razon_social: "Factor sintético" } });
  const bank = await db.banco.create({ data: { tipo: "Prueba", nombre: "Banco sintético", alias: "IT" } });
  const type = await db.cuenta_tipo.create({ data: { nombre: "Prueba", alias: "IT" } }),
    status = await db.cuenta_bancaria_estado.create({ data: { nombre: "Prueba", alias: "IT" } });
  const bankAccount = await db.cuenta_bancaria.create({ data: { code: "IT-CUENTA", idbanco: bank.idbanco, idcuentatipo: type.idcuentatipo, idmoneda: 1, idcuentabancariaestado: status.idcuentabancariaestado, numero: "00001", cci: "00000000000000000001", alias: "Sintética" } });
  const factorAccount = await db.factor_cuenta_bancaria.create({ data: { idfactorcuentabancaria: 1, code: "IT-FCUENTA", idfactor: 1, idcuentabancaria: bankAccount.idcuentabancaria } });
  account = factorAccount.factorcuentabancariaid;
  const c = await configService.guardarConexion(null, { alias: "Fuente sintética", host: "mysql.example.test", puerto: 3306, base_datos: "banco", motor: "MYSQL", usuario: "solo_lectura", password: "contraseña-sintética", habilitado: true, tls_habilitado: true }, user.idusuario);
  connection = c.configuracionbbddid;
  await service.crearMapeo({ conexion: connection, cuenta: account, cuenta_origen: "PEN-A" }, user.idusuario);
  b.read.mockReset().mockResolvedValue([source]);
});
afterEach(async () => {
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_bank_history_failure");
  await db.factor_transaccion_bancaria_historial.deleteMany({});
  await db.factor_transaccion_bancaria_incidencia.deleteMany({});
  await db.factor_transaccion_bancaria.deleteMany({});
  await db.factor_transaccion_bancaria_sincronizacion.deleteMany({});
  await db.factor_transaccion_bancaria_origen_cuenta.deleteMany({});
  await db.factor_transaccion_bancaria_fuente.deleteMany({});
  await db.configuracion_bbdd.deleteMany({});
  await cleanFixtures();
  vi.unstubAllEnvs();
});
afterAll(async () => {
  await db.$disconnect();
});
const run = () => service.sincronizar({ conexion: connection, desde: null, hasta: null, historico: false }, user.idusuario);
const manual = () => ({ cuenta: account, fecha: "2026-10-15", numero_operacion: "00001", descripcion: source.descripcion, signo: -1 as const, monto: "100.25" });
it("almacena GCM y consulta no expone materiales criptográficos", async () => {
  const stored = await db.configuracion_bbdd.findUniqueOrThrow({ where: { configuracionbbddid: connection } });
  expect(descifrarPassword(stored, connection)).toBe("contraseña-sintética");
  expect(JSON.stringify(await configService.listarConexiones())).not.toMatch(/password_cifrado|password_nonce|password_tag|contraseña/);
  expect(JSON.stringify(await service.masterBanco())).not.toMatch(/mysql.example|solo_lectura|password/);
});
it("relectura idempotente enlaza alta manual y conserva enriquecimiento", async () => {
  const row = await service.crearMovimiento({ ...manual(), referencia_descripcion: "Clasificación local" }, user.idusuario);
  await run();
  await run();
  const all = await db.factor_transaccion_bancaria.findMany();
  expect(all).toHaveLength(1);
  expect(all[0].factortransaccionbancariaid).toBe(row.factortransaccionbancariaid);
  expect(all[0].referencia_descripcion).toBe("Clasificación local");
  expect(all[0].monto.toFixed(2)).toBe("100.25");
  expect(all[0].signo).toBe(-1);
});
it("CHECK reales rechazan signo cero e importe negativo", async () => {
  await run();
  const row = await db.factor_transaccion_bancaria.findFirstOrThrow();
  await expect(db.factor_transaccion_bancaria.update({ where: { idfactortransaccionbancaria: row.idfactortransaccionbancaria }, data: { signo: 0 } })).rejects.toThrow();
  await expect(db.factor_transaccion_bancaria.update({ where: { idfactortransaccionbancaria: row.idfactortransaccionbancaria }, data: { monto: "-1.00" } })).rejects.toThrow();
  expect((await db.factor_transaccion_bancaria.findFirstOrThrow()).monto.toFixed(2)).toBe("100.25");
});
it("un fallo de historial revierte el alta en la misma transacción", async () => {
  await db.$executeRawUnsafe("CREATE TRIGGER it_bank_history_failure BEFORE INSERT ON factor_transaccion_bancaria_historial FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fallo sintetico'");
  await expect(service.crearMovimiento(manual(), user.idusuario)).rejects.toThrow();
  expect(await db.factor_transaccion_bancaria.count()).toBe(0);
});
it("duplicados concurrentes no producen dos movimientos", async () => {
  const results = await Promise.allSettled([service.crearMovimiento(manual(), user.idusuario), service.crearMovimiento(manual(), user.idusuario)]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(await db.factor_transaccion_bancaria.count()).toBe(1);
});
it("bloqueo asesor coordina dos sincronizaciones reales", async () => {
  let release: (() => void) | undefined;
  b.read.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve([source]);
      }),
  );
  const first = run();
  await vi.waitFor(() => expect(release).toBeTypeOf("function"), { timeout: 5000 });
  try {
    await expect(run()).rejects.toMatchObject({ statusCode: 409 });
  } finally {
    release!();
  }
  expect((await first).resultado).toBe("EXITOSA");
  expect(await db.factor_transaccion_bancaria.count()).toBe(1);
});
