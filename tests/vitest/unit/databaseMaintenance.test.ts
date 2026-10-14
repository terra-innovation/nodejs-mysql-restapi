import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertApplyAuthorization, describeStatements, expectedComments, identifier, loadPlan, readDevelopmentTarget, redact, safeError, splitSql } from "../../../scripts/database/maintenance-core.mjs";

const temporary: string[] = [];
afterEach(async () => { vi.unstubAllEnvs(); await Promise.all(temporary.splice(0).map((p) => rm(p, { recursive: true, force: true }))); });

describe("Mantenimiento DDL explícito y acotado", () => {
  it("no separa sentencias por punto y coma dentro de valores/comentarios", () => {
    const statements = splitSql("-- comentario; no SQL\nCREATE TABLE `ejemplo` (`nombre` VARCHAR(20) COMMENT 'importe; no final'); /* otro; */ INSERT INTO `ejemplo` (`nombre`) VALUES ('a'';b');");
    expect(statements).toHaveLength(2);
    expect(statements[1]).toContain("'a'';b'");
  });
  it.each(["/*! DROP TABLE `factoring` */;", "/*M! DROP TABLE `factoring` */;", "CREATE TABLE `x` (`a` INT COMMENT 'sin cierre);"])("rechaza directivas ejecutables o SQL incompleto", (sql) => {
    expect(() => splitSql(sql)).toThrow();
  });
  it("rechaza DROP, DML ajeno y CREATE fuera del manifiesto antes de conectar", () => {
    const scope = { createTables: ["permitida"], alterTables: [], seedTables: [] };
    for (const sql of ["DROP TABLE `factoring`", "UPDATE `factoring` SET estado=2", "CREATE TABLE `ajena` (`id` INT)"]) expect(() => describeStatements([sql], scope)).toThrow();
  });
  it("no permite semillas sobre tablas existentes ni omitir una creación aprobada", () => {
    expect(() => describeStatements(["INSERT INTO `factoring` (`estado`) VALUES (1)"], { createTables: [], seedTables: ["factoring"] })).toThrow();
    expect(() => describeStatements(["CREATE TABLE `a` (`id` INT)"], { createTables: ["a", "b"] })).toThrow();
  });
  it("vincula la aplicación al plan, al destino y a autorización expresa", () => {
    expect(() => assertApplyAuthorization({ apply: true }, "plan", "destino")).toThrow();
    expect(() => assertApplyAuthorization({ apply: true, "expected-plan": "otro", "expected-target": "destino", authorization: "usuario" }, "plan", "destino")).toThrow();
    expect(() => assertApplyAuthorization({ apply: true, "expected-plan": "plan", "expected-target": "destino", authorization: "usuario" }, "plan", "destino")).not.toThrow();
    expect(() => assertApplyAuthorization({}, "plan", "destino")).not.toThrow();
  });
  it("lee el archivo de desarrollo explícito aunque exista una URL heredada distinta", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "ft-ddl-unit-")); temporary.push(dir);
    const file = path.join(dir, ".env.development");
    await writeFile(file, "PRISMA_DATABASE_FACTORING_URL=mysql://guest:p%40ss@dev.invalid:3307/copiatest\n");
    vi.stubEnv("PRISMA_DATABASE_FACTORING_URL", "mysql://production:secret@production.invalid/production");
    const target = await readDevelopmentTarget(file);
    expect(target.options).toMatchObject({ host: "dev.invalid", port: 3307, database: "copiatest", password: "p@ss", multipleStatements: false });
    expect(target.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    const redacted = redact(`${target.url} ${target.options.host} ${target.options.password}`, target);
    expect(redacted).not.toContain("p@ss"); expect(redacted).not.toContain("dev.invalid"); expect(redacted).not.toContain("mysql://");
  });
  it("nunca expone el mensaje del driver", () => {
    const result = safeError({ code: "ER_ACCESS_DENIED_ERROR", message: "secret-password host private-db" });
    expect(result).toContain("ER_ACCESS_DENIED_ERROR"); expect(result).not.toContain("secret-password");
  });
  it("admite PK físicas del proyecto y rechaza identificadores inyectados", () => {
    expect(identifier("_idfactoring")).toBe("`_idfactoring`");
    expect(() => identifier("factoring`; DROP TABLE x")).toThrow();
  });
  it("el plan SBS contiene solo las cuatro tablas aprobadas y comentarios completos", async () => {
    const loaded = await loadPlan("scripts/database/plans/20261014-sbs-saldo-contable.json");
    expect(loaded.steps.map((s) => s.kind)).toEqual(["create", "create", "create", "create", "seed", "seed"]);
    expect(loaded.plan.alterTables).toEqual([]);
    const expected = loaded.steps.filter((s) => s.kind === "create").map((s) => expectedComments(s.sql));
    expect(expected.map((e) => e.columns.length)).toEqual([12, 13, 18, 23]);
    expect(expected.every((e) => e.table && e.columns.every((c) => c.comment.length > 60))).toBe(true);
  });
});
