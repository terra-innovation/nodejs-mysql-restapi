import { beforeEach, afterEach, expect, it, vi } from "vitest";
const b = vi.hoisted(() => ({ connect: vi.fn(), query: vi.fn(), end: vi.fn(), dns: vi.fn() }));
vi.mock("mariadb", () => ({ default: { createConnection: b.connect } }));
vi.mock("node:dns/promises", () => ({ lookup: b.dns }));
import { diagnoseConnection } from "#src/integrations/bbdd/mysqlConnection.js";
import { cifrarPassword } from "#src/providers/bbdd/bbddCrypto.js";
import { configuracionBbdd } from "#src/types/ConfiguracionBbdd.schemas.js";
const config = { motor: "MYSQL", host: "mysql.example.test", puerto: 3306, base_datos: "manual", usuario: "sintetico", password: "secreto-sintetico", tls_ca_referencia: null };
it("permite nombres manuales de bases con guiones y Unicode sin columnas bancarias", () => {
  expect(configuracionBbdd.parse({ ...config, alias: "Prueba", base_datos: "base-año", habilitado: true }).base_datos).toBe("base-año");
  expect(configuracionBbdd.safeParse({ ...config, alias: "Prueba", habilitado: true, tabla_origen: "bcp" }).success).toBe(false);
  expect(configuracionBbdd.safeParse({ ...config, alias: "Prueba", habilitado: true, base_datos: "base\u0000" }).success).toBe(false);
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("BBDD_KEYS", JSON.stringify({ v1: Buffer.alloc(32, 7).toString("base64") }));
  vi.stubEnv("BBDD_ACTIVE_KEY", "v1");
  vi.stubEnv("BBDD_ALLOWED_TARGETS", '["mysql.example.test:3306"]');
  b.dns.mockResolvedValue({ address: "127.0.0.1" });
  b.end.mockResolvedValue(undefined);
  b.connect.mockResolvedValue({ query: b.query, end: b.end, escapeId: (s: string) => "`" + s.replaceAll("`", "``") + "`" });
  b.query.mockImplementation(async (sql: string) => (sql === "SHOW DATABASES" ? [{ Database: "banco" }, { Database: "manual" }] : []));
});
afterEach(() => vi.unstubAllEnvs());
it("diagnostica borrador, lista bases y devuelve pasos medidos sin contrato bancario", async () => {
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.correcto).toBe(true);
  expect(result.bases_datos).toEqual(["banco", "manual"]);
  expect(b.connect).toHaveBeenCalledWith(expect.objectContaining({ database: undefined, password: config.password, ssl: expect.objectContaining({ rejectUnauthorized: true }) }));
  expect(b.query.mock.calls.map((c) => c[0])).toEqual(["SHOW DATABASES", "USE `manual`"]);
  expect(result.pasos.every((s) => s.duracion_ms >= 0)).toBe(true);
  expect(result.log[0]).toMatch(/^\[\d+\.\d{3}s\]/);
  expect(JSON.stringify(result)).not.toContain(config.password);
  expect(b.end).toHaveBeenCalledOnce();
});
it.each(["ENOTFOUND", "ECONNREFUSED", "ER_ACCESS_DENIED_ERROR", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID", "ER_SERVER_SSL_DISABLED", "ER_NODE_NOT_SUPPORTED_TLS", "ER_TLS_IDENTITY_ERROR", "ER_SOCKET_TIMEOUT", "ER_SOCKET_UNEXPECTED_CLOSE"])("explica %s sin publicar el mensaje inseguro del driver", async (code) => {
  b.connect.mockRejectedValue(Object.assign(new Error("password=secreto-sintetico; SQL privado"), { code }));
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.correcto).toBe(false);
  expect(result.message).toContain(code);
  expect(result.pasos.some((p) => p.resultado === "error")).toBe(true);
  expect(JSON.stringify(result)).not.toMatch(/secreto-sintetico|SQL privado/);
});
it("un servidor sin TLS no provoca un reintento automático sin cifrado", async () => {
  b.connect.mockRejectedValue(Object.assign(new Error("secreto privado"), { code: "ER_SERVER_SSL_DISABLED" }));
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.message).toContain("SSL deshabilitado");
  expect(b.connect).toHaveBeenCalledOnce();
  expect(b.connect.mock.calls[0][0].ssl).toMatchObject({ rejectUnauthorized: true });
});
it("permite sin TLS solo por decisión explícita y muestra una advertencia efímera", async () => {
  const result = await diagnoseConnection(async () => ({ config: { ...config, tls_habilitado: false, tls_ca_referencia: "ca-no-usada" } }));
  expect(result.correcto).toBe(true);
  expect(result.message).toContain("sin TLS");
  expect(result.log.join()).toContain("TLS desactivado explícitamente");
  expect(b.connect.mock.calls[0][0]).toMatchObject({ ssl: false, multipleStatements: false });
  expect(result.pasos.some((p) => p.resultado === "advertencia")).toBe(true);
});
it("sin TLS sigue exigiendo destino autorizado y no abre una conexión si falta", async () => {
  vi.stubEnv("BBDD_ALLOWED_TARGETS", "[]");
  const result = await diagnoseConnection(async () => ({ config: { ...config, tls_habilitado: false } }));
  expect(result.correcto).toBe(false);
  expect(b.connect).not.toHaveBeenCalled();
});
it("publica la causa TLS conocida de un error envuelto y nunca su mensaje privado", async () => {
  b.connect.mockRejectedValue(Object.assign(new Error("password=secreto"), { code: "ER_SOCKET_UNEXPECTED_CLOSE", cause: Object.assign(new Error("SQL privado"), { code: "CERT_HAS_EXPIRED" }) }));
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.message).toContain("CERT_HAS_EXPIRED");
  expect(JSON.stringify(result)).not.toMatch(/password=|SQL privado/);
});
it("informa cifrado ausente y permite probar contraseña transitoria sin guardarla", async () => {
  vi.stubEnv("BBDD_ACTIVE_KEY", "");
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.correcto).toBe(true);
  expect(result.log.join()).toContain("BBDD_ACTIVE_KEY");
  expect(result.pasos.some((p) => p.resultado === "advertencia")).toBe(true);
});
it("conserva las bases detectadas si falla el acceso al nombre escrito manualmente", async () => {
  b.query.mockImplementation(async (sql: string) => {
    if (sql === "SHOW DATABASES") return [{ Database: "accesible" }];
    throw Object.assign(new Error("datos privados"), { code: "ER_BAD_DB_ERROR" });
  });
  const result = await diagnoseConnection(async () => ({ config }));
  expect(result.correcto).toBe(false);
  expect(result.bases_datos).toEqual(["accesible"]);
  expect(result.message).toContain("nombre manualmente");
  expect(b.end).toHaveBeenCalledOnce();
});
it("contraseña omitida usa secreto almacenado y metadatos nuevos del borrador", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const stored = { ...config, ...cifrarPassword("guardado-sintetico", id), configuracionbbddid: id };
  await diagnoseConnection(async () => ({ config: { ...config, password: undefined, usuario: "nuevo" }, stored }));
  expect(b.connect).toHaveBeenCalledWith(expect.objectContaining({ user: "nuevo", password: "guardado-sintetico" }));
});
it("señala la clave requerida al no poder descifrar y no consulta la red", async () => {
  const id = "00000000-0000-4000-8000-000000000001",
    stored = { ...config, ...cifrarPassword("guardado", id), configuracionbbddid: id };
  vi.stubEnv("BBDD_KEYS", "{}");
  const result = await diagnoseConnection(async () => ({ config: { ...config, password: undefined }, stored }));
  expect(result.correcto).toBe(false);
  expect(result.message).toContain("BBDD_KEYS");
  expect(b.connect).not.toHaveBeenCalled();
});
