import { afterAll, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { db } from "./businessSupport.js";
import { splitSql } from "../../scripts/database/maintenance-core.mjs";

afterAll(async () => {
  for (const table of ["it_factoring_pago_historial", "it_factoring_pago_detalle", "it_factoring_pago", "it_factoring_pago_estado"]) await db.$executeRawUnsafe(`DROP TABLE IF EXISTS ${table}`);
  await db.$disconnect();
});
it("la guarda de vacío rechaza filas y bloquea nuevas escrituras hasta completar el DDL", async () => {
  await db.$executeRawUnsafe("CREATE TABLE it_pago_guard (id INT NOT NULL) ENGINE=InnoDB");
  await db.$executeRawUnsafe("INSERT INTO it_pago_guard VALUES (1)");
  await expect(db.$executeRawUnsafe("ALTER TABLE it_pago_guard ADD CONSTRAINT CK_it_vacia CHECK (id < 0), ALGORITHM=COPY, LOCK=EXCLUSIVE")).rejects.toThrow();
  expect(await db.$queryRawUnsafe("SELECT id FROM it_pago_guard")).toEqual([{ id: 1 }]);
  await db.$executeRawUnsafe("DELETE FROM it_pago_guard");
  await db.$executeRawUnsafe("ALTER TABLE it_pago_guard ADD CONSTRAINT CK_it_vacia CHECK (id < 0), ALGORITHM=COPY, LOCK=EXCLUSIVE");
  await expect(db.$executeRawUnsafe("INSERT INTO it_pago_guard VALUES (2)")).rejects.toThrow();
  await db.$executeRawUnsafe("ALTER TABLE it_pago_guard DROP CONSTRAINT CK_it_vacia");
  await db.$executeRawUnsafe("INSERT INTO it_pago_guard VALUES (2)");
  await db.$executeRawUnsafe("DROP TABLE it_pago_guard");
});
it("aplica el manifiesto sobre el baseline vacío sin crear pagos ni eliminar controles", async () => {
  const rename = (sql: string) => sql.replace(/`(factoring_pago(?:_estado|_detalle|_historial)?)`/g, "`it_$1`").replace(/`((?:FK|CK)_[^`]+)`/g, "`it_$1`");
  const legacy = await readFile(new URL("./schema/factoring-pago-legacy.sql", import.meta.url), "utf8");
  await db.$executeRawUnsafe(rename(splitSql(legacy)[0]));
  const ddl = await readFile(new URL("../../docs/pagos-factoring/esquema-propuesto.sql", import.meta.url), "utf8");
  for (const sql of splitSql(ddl)) await db.$executeRawUnsafe(rename(sql));
  expect(await db.$queryRawUnsafe("SELECT COUNT(*) AS n FROM it_factoring_pago")).toEqual([{ n: 0n }]);
  const checks = await db.$queryRawUnsafe<{ CONSTRAINT_NAME: string }[]>("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='it_factoring_pago' AND CONSTRAINT_TYPE='CHECK'");
  expect(checks.map((c) => c.CONSTRAINT_NAME)).toContain("it_CK_fp_estado");
  expect(checks.map((c) => c.CONSTRAINT_NAME)).not.toContain("it_CK_fp_transicion_vacia");
});
