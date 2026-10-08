import { writeFile, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { baselinePath, developmentSource, connect, inventory, tableDefinitions, schemaHash, validateBaseline } from "./mariadb-common.mjs";

let connection;
const temp = baselinePath + "." + randomUUID() + ".tmp";
try {
  const source = await developmentSource();
  connection = await connect(source);
  await connection.query("SET SESSION TRANSACTION READ ONLY");
  const [server] = await connection.query("SELECT VERSION() AS version, @@sql_mode AS sqlMode");
  if (!server.version.includes("MariaDB")) throw new Error("La fuente configurada no es MariaDB.");
  const [schema] = await connection.query("SELECT DEFAULT_CHARACTER_SET_NAME AS charset, DEFAULT_COLLATION_NAME AS collation FROM information_schema.SCHEMATA WHERE SCHEMA_NAME=DATABASE()");
  const objects = await inventory(connection);
  if (Object.values(objects).some(count => count !== 0)) {
    throw new Error("La fuente contiene vistas, triggers, rutinas, eventos o referencias externas. Se rechaza una exportación parcial; ampliar el exportador antes de actualizar la estructura.");
  }
  const tables = await tableDefinitions(connection);
  const secondPass = await tableDefinitions(connection);
  if (schemaHash(tables) !== schemaHash(secondPass) || Object.values(await inventory(connection)).some(count => count !== 0)) {
    throw new Error("La estructura cambió durante la lectura. Reintentar sin cambios DDL en desarrollo.");
  }
  const baseline = validateBaseline({
    formatVersion: 1, engine: "MariaDB", source: ".env.development",
    sourceVersion: server.version, capturedAt: new Date().toISOString(),
    charset: schema.charset, collation: schema.collation, sqlMode: server.sqlMode,
    objects, tables, sha256: schemaHash(tables),
  });
  await mkdir(path.dirname(baselinePath), { recursive: true });
  await writeFile(temp, JSON.stringify(baseline, null, 2) + "\n", { flag: "wx" });
  await rename(temp, baselinePath);
  console.log(`Estructura exportada: ${tables.length} tablas, cero registros, ${server.version}.\nArchivo: tests/mariadb/schema/baseline.json`);
} catch (error) {
  // No mostrar mensajes del driver: pueden contener SQL, usuarios o credenciales.
  console.error(error.sqlState || error.code ? `No se pudo exportar la estructura (${error.code ?? error.sqlState}).` : error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
  await rm(temp, { force: true });
}
