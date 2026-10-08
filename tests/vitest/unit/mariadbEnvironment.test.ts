import { describe, expect, it } from "vitest";
import { assertTestTarget, assertOwnedContainer, connectionOptions, schemaHash, validateBaseline, quoteIdentifier, testArguments } from "../../../scripts/integration/mariadb-common.mjs";

const runId = "a".repeat(24);
const url = `mysql://ft_test:test@127.0.0.1:43210/ft_integration_${runId}`;
describe("Protecciones del entorno MariaDB desechable", () => {
  it("acepta únicamente el destino local del identificador de ejecución", () => {
    expect(assertTestTarget(url, runId)).toMatchObject({ host: "127.0.0.1", port: 43210, database: `ft_integration_${runId}`, user: "ft_test" });
  });
  it.each([
    url.replace("127.0.0.1", "db.example.com"), url.replace("43210", "3306"),
    url.replace("ft_test:", "root:"), url.replace(`ft_integration_${runId}`, "desarrollo"),
    url.replace(runId, "b".repeat(24)),
  ])("rechaza fuente de desarrollo, base ajena o destino remoto antes de conectar", value => {
    expect(() => assertTestTarget(value, runId)).toThrow("Destino rechazado");
  });
  it.each([undefined, "", "../unsafe", "b".repeat(24)])("identificador inválido/ajeno %s no conecta", value => {
    expect(() => assertTestTarget(url, value)).toThrow("Destino rechazado");
  });
  it("no permite limpiar un contenedor ajeno aunque su nombre tenga el prefijo correcto", () => {
    expect(() => assertOwnedContainer(`ft-backend-it-${runId}`, runId, "b".repeat(24))).toThrow("Contenedor ajeno");
    expect(() => assertOwnedContainer("companydb", runId, runId)).toThrow("Contenedor ajeno");
    expect(() => assertOwnedContainer(`ft-backend-it-${runId}`, runId, runId)).not.toThrow();
  });
  it("no ignora opciones de transporte de la fuente y decodifica credenciales sin mostrarlas", () => {
    expect(connectionOptions("mysql://test:p%40ss@localhost:3307/development")).toMatchObject({ password: "p@ss", port: 3307 });
    expect(() => connectionOptions(url + "?sslaccept=strict")).toThrow("opciones no soportadas");
  });
  it("rechaza snapshot alterado, duplicado o tabla reservada", () => {
    const tables = [{ name: "factura", sql: "CREATE TABLE `factura` (id INT) ENGINE=InnoDB" }];
    const base = { formatVersion: 1, engine: "MariaDB", sourceVersion: "11.4.2-MariaDB", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", sqlMode: "", tables, sha256: schemaHash(tables) };
    expect(validateBaseline(base)).toBe(base);
    expect(() => validateBaseline({ ...base, sha256: "modified" })).toThrow("Hash");
    expect(() => validateBaseline({ ...base, tables: [tables[0], tables[0]] })).toThrow("DDL");
    const reserved = [{ name: "__ft_integration_guard", sql: "CREATE TABLE `__ft_integration_guard` (id INT)" }];
    expect(() => validateBaseline({ ...base, tables: reserved, sha256: schemaHash(reserved) })).toThrow("reservada");
  });
  it("escapa identificadores SQL sin convertirlos en instrucciones", () => {
    expect(quoteIdentifier("a`b")).toBe("`a``b`");
  });
  it("rechaza cambiar configuración/ruta de la suite aunque se pasen argumentos al comando", () => {
    expect(() => testArguments(["--config", "vitest.config.ts"])).toThrow("no se permite");
    expect(() => testArguments(["../unit/test.ts"])).toThrow("no se permite");
    expect(testArguments(["tests/mariadb/environment.test.ts", "-t", "Prisma"])).toEqual(["tests/mariadb/environment.test.ts", "-t", "Prisma"]);
  });
});
