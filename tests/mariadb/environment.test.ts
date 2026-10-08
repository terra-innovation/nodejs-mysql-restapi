import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "#root/generated/prisma/ft_factoring/client.js";
import { assertTestTarget, connect, loadBaseline, guardTable, quoteIdentifier } from "../../scripts/integration/mariadb-common.mjs";

// Fallar antes de abrir una conexión si se intenta ejecutar esta suite directamente.
const runId = process.env.FT_INTEGRATION_RUN_ID;
const url = process.env.FT_INTEGRATION_DATABASE_URL;
const options = assertTestTarget(url, runId);
const baseline = await loadBaseline();
const prisma = new PrismaClient({ datasources: { db: { url } } });
let connection: Awaited<ReturnType<typeof connect>>;

beforeAll(async () => {
  connection = await connect(options);
  const rows = await connection.query(`SELECT * FROM ${quoteIdentifier(guardTable)} WHERE run_id=?`, [runId]);
  if (rows.length !== 1 || rows[0].schema_hash !== baseline.sha256) throw new Error("Base ajena o estructura incorrecta.");
  await prisma.$connect();
});
afterAll(async () => { await prisma.$disconnect(); if (connection) await connection.end(); });

describe("Entorno desechable MariaDB: conexiones reales", () => {
  it("usa MariaDB 11.4.10, el esquema exclusivo y UTC", async () => {
    const [row] = await prisma.$queryRaw<Array<{ version: string; db: string; timezone: string }>>`SELECT VERSION() AS version, DATABASE() AS db, @@session.time_zone AS timezone`;
    expect(row.version).toMatch(/^11\.4\.10-MariaDB/);
    expect(row.db).toBe(`ft_integration_${runId}`);
    expect(row.timezone).toBe("+00:00");
  });
  it("restaura todas las tablas del snapshot sin copiar registros de desarrollo", async () => {
    const tables = await connection.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
    expect(tables.map(row => row.name).filter(name => name !== guardTable)).toEqual(baseline.tables.map(table => table.name));
    for (const table of baseline.tables) {
      const [row] = await connection.query(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table.name)}`);
      expect(Number(row.count), table.name).toBe(0);
    }
  });
  it("conserva las claves foráneas y el charset de las tablas", async () => {
    const tables = await connection.query("SELECT TABLE_NAME AS name, TABLE_COLLATION AS collation FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME<>?", [guardTable]);
    expect(tables.every(row => typeof row.collation === "string")).toBe(true);
    for (const table of baseline.tables) {
      const [actual] = await connection.query(`SHOW CREATE TABLE ${quoteIdentifier(table.name)}`);
      const expectedKeys = table.sql.match(/CONSTRAINT .* FOREIGN KEY .*$/gm) ?? [];
      const actualKeys = actual["Create Table"].match(/CONSTRAINT .* FOREIGN KEY .*$/gm) ?? [];
      expect(actualKeys, table.name).toEqual(expectedKeys);
      const expectedCollation = table.sql.match(/COLLATE=([a-z0-9_]+)/i)?.[1];
      if (expectedCollation) expect(tables.find(row => row.name === table.name)?.collation).toBe(expectedCollation);
    }
  });
  it("el cliente Prisma real puede leer facturas e ítems con su mapeo actual", async () => {
    await expect(prisma.factura.findMany({ take: 1 })).resolves.toEqual([]);
    await expect(prisma.factura_item.findMany({ take: 1 })).resolves.toEqual([]);
  });
});
