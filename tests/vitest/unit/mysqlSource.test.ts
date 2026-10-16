import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { cifrarPassword } from "#src/providers/bbdd/bbddCrypto.js";
const b = vi.hoisted(() => ({ connect: vi.fn(), query: vi.fn(), begin: vi.fn(), commit: vi.fn(), end: vi.fn(), grants: "GRANT SELECT ON `banco`.`bcp_transaccion_ahorro` TO `lector`@`%`", rows: [] as Record<string, unknown>[] }));
vi.mock("mariadb", () => ({ default: { createConnection: b.connect } }));
import { readSource, browseSource, sourceOptions, sqlIdentifier } from "#src/integrations/banca/mysqlSource.js";
const uuid = "00000000-0000-4000-8000-000000000001";
function config() {
  return { ...cifrarPassword("dato-sintético", uuid), configuracionbbddid: uuid, host: "mysql.example.test", puerto: 3306, base_datos: "banco", tabla_origen: "bcp_transaccion_ahorro", usuario: "lector", tls_ca_referencia: null };
}
beforeEach(() => {
  vi.stubEnv("BANK_SYNC_KEYS", JSON.stringify({ v1: randomBytes(32).toString("base64") }));
  vi.stubEnv("BANK_SYNC_ACTIVE_KEY", "v1");
  vi.stubEnv("BANK_SYNC_ALLOWED_TARGETS", JSON.stringify(["mysql.example.test:3306"]));
  vi.stubEnv("BANK_SYNC_MAX_ROWS", "10");
  b.grants = "GRANT SELECT ON `banco`.`bcp_transaccion_ahorro` TO `lector`@`%`";
  b.rows = [];
  vi.clearAllMocks();
  b.connect.mockResolvedValue({ query: b.query, beginTransaction: b.begin, commit: b.commit, end: b.end });
  b.end.mockResolvedValue(undefined);
  b.query.mockImplementation(async (sql: string) => (sql.startsWith("SHOW GRANTS") ? [{ grant: b.grants }] : sql.startsWith("SELECT") ? b.rows : []));
});
afterEach(() => vi.unstubAllEnvs());
it("exige destino permitido y TLS autenticado, conserva decimales como texto", async () => {
  const c = config(),
    options = await sourceOptions(c);
  expect(options.decimalAsNumber).toBe(false);
  expect(options.multipleStatements).toBe(false);
  expect(options.ssl).toMatchObject({ rejectUnauthorized: true });
  vi.stubEnv("BANK_SYNC_ALLOWED_TARGETS", "[]");
  await expect(sourceOptions(c)).rejects.toMatchObject({ statusCode: 422 });
  expect(b.connect).not.toHaveBeenCalled();
});
it("consulta parametrizada y sesión readonly no ejecutan escrituras", async () => {
  await readSource(config(), ["PEN-A"], "2026-01-01", "2026-10-15");
  expect(b.query).toHaveBeenCalledWith("SET TRANSACTION READ ONLY");
  expect(b.query).toHaveBeenCalledWith("SET SESSION time_zone = '+00:00'");
  expect(b.begin).toHaveBeenCalledOnce();
  expect(b.commit).toHaveBeenCalledOnce();
  const call = b.query.mock.calls.find((args) => String(args[0]).startsWith("SELECT"))!;
  expect(call[0]).toContain("IN (?)");
  expect(call[0]).toContain("LIMIT ?");
  expect(call[1]).toEqual(["PEN-A", "2026-01-01", "2026-10-15", 11]);
  expect(b.end).toHaveBeenCalledOnce();
});
it.each(["GRANT SELECT ON `banco`.*", "GRANT SELECT, UPDATE ON `banco`.*", "GRANT ALL PRIVILEGES ON *.*"])("lee sin inspeccionar privilegios administrativos: %s", async (grants) => {
  b.grants = grants;
  b.rows = [{ cuenta: "PEN-A", monto: "1.00" }];
  b.query.mockImplementation(async (sql: string) => {
    if (sql.startsWith("SHOW GRANTS")) throw new Error("No se deben inspeccionar privilegios");
    return sql.startsWith("SELECT") ? b.rows : [];
  });
  expect(await readSource(config(), ["PEN-A"], null, null)).toEqual(b.rows);
  expect(b.query.mock.calls.every(([sql]) => sql === "SET SESSION time_zone = '+00:00'" || sql === "SET TRANSACTION READ ONLY" || String(sql).startsWith("SELECT "))).toBe(true);
  expect(b.begin).toHaveBeenCalledOnce();
  expect(b.commit).toHaveBeenCalledOnce();
  expect(b.end).toHaveBeenCalledOnce();
});
it("si MariaDB deniega SELECT no confirma la lectura ni publica detalles privados", async () => {
  b.query.mockImplementation(async (sql: string) => {
    if (sql.startsWith("SELECT")) throw Object.assign(new Error("SQL y datos privados"), { code: "ER_TABLEACCESS_DENIED_ERROR" });
    return [];
  });
  await expect(readSource(config(), ["PEN-A"], null, null)).rejects.toThrow("permisos SELECT");
  expect(b.commit).not.toHaveBeenCalled();
  expect(b.end).toHaveBeenCalledOnce();
});
it("no declara lectura completa si la extracción excede el límite", async () => {
  b.rows = Array.from({ length: 11 }, () => ({ monto: "1.00" }));
  await expect(readSource(config(), ["PEN-A"], null, null)).rejects.toThrow("límite");
  expect(b.commit).not.toHaveBeenCalled();
  expect(b.end).toHaveBeenCalledOnce();
});
it("rechaza inyección SQL y referencias de CA libres", async () => {
  expect(() => sqlIdentifier("banco; DROP TABLE x")).toThrow();
  const c = config();
  await expect(sourceOptions({ ...c, tls_ca_referencia: "../../archivo" })).rejects.toThrow("CA");
});
it("fallos TLS/red se sanitizan y siempre cierran la conexión", async () => {
  b.query.mockRejectedValue(new Error("password=secreto; cliente=privado"));
  await expect(readSource(config(), ["PEN-A"], null, null)).rejects.toThrow("No se pudo leer MySQL remoto");
  expect(b.end).toHaveBeenCalledOnce();
});
it("pagina con precisión, conserva fechas civiles y convierte TIMESTAMP desde UTC", async () => {
  b.query.mockImplementation(async (sql: string) => {
    if (sql.includes("information_schema.COLUMNS"))
      return [
        { nombre: "fecha", tipo: "date" },
        { nombre: "monto", tipo: "decimal" },
        { nombre: "fechacrea", tipo: "timestamp" },
        { nombre: "fechamod", tipo: "datetime" },
      ];
    if (sql.startsWith("SELECT COUNT")) return [{ total: 31n }];
    if (sql.startsWith("SELECT")) return [{ cuenta: "PEN-A", numerooperacion: "0001", fecha: "2026-01-01", monto: "12345678.90", fechacrea: "2026-01-02 03:04:05.123", fechamod: "2026-01-02 08:04:05.123" }];
    return [];
  });
  const result = await browseSource(config(), { desde: "2026-01-01", hasta: "2026-01-31", page: 2, limit: 10, search: "texto%'", sortBy: "monto", desc: false });
  expect(result.total).toBe(31);
  expect(result.items[0]).toMatchObject({ fecha: "2026-01-01", monto: "12345678.90", fechacrea: "2026-01-02T03:04:05.123Z", fechamod: "2026-01-02 08:04:05.123" });
  const call = b.query.mock.calls.find(([sql]) => String(sql).includes("OFFSET"))!;
  expect(call[0]).toContain("ORDER BY `monto` ASC");
  expect(call[0]).not.toContain("CONVERT_TZ");
  expect(call[0]).not.toContain("texto%'");
  expect(call[1]).toEqual(["2026-01-01", "2026-01-31", ...Array(4).fill("texto%'"), 10, 10]);
  expect(b.query).toHaveBeenCalledWith("SET SESSION time_zone = '+00:00'");
  expect(b.commit).toHaveBeenCalledOnce();
  expect(b.end).toHaveBeenCalledOnce();
});
it("rechaza rango vacío e inyección de orden antes de conectar", async () => {
  const q = { desde: "2026-01-01", hasta: "2026-01-31", page: 1, limit: 10, search: "" };
  await expect(browseSource(config(), { ...q, desde: "" })).rejects.toThrow("rango");
  await expect(browseSource(config(), { ...q, sortBy: "monto; DROP TABLE x" })).rejects.toThrow("orden");
  expect(b.connect).not.toHaveBeenCalled();
});
