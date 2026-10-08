import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { connect, developmentSource, root } from "./mariadb-common.mjs";
import { inspectHistoricalFactoring } from "./historical-factoring-query.mjs";

let connection;
try {
  if (process.argv.length !== 2) throw new Error("Este comando no admite cambiar la fuente: utiliza .env.development.");
  connection = await connect(await developmentSource());
  await connection.query("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ");
  await connection.query("SET SESSION TRANSACTION READ ONLY");
  await connection.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
  const [server] = await connection.query("SELECT VERSION() AS version");
  if (!server.version.includes("MariaDB")) throw new Error("La fuente debe ser MariaDB.");
  const results = await inspectHistoricalFactoring(sql => connection.query(sql));
  await connection.rollback();
  const report = { generatedAt: new Date().toISOString(), source: ".env.development", sourceVersion: server.version,
    readOnly: true, scope: "Operaciones de cualquier estado con cantidad declarada o vinculada mayor que uno; incluye vínculos/facturas eliminados lógicamente.",
    limitations: "Compara datos actuales; no reconstruye valores al crear la operación ni identifica por sí solo la causa. No certifica producción ni operaciones de una factura.",
    ...results };
  const directory = path.join(root, "coverage", "audit");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "historical-factoring.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ source: report.source, totalOperations: report.totalOperations, checked: report.checked, consistent: report.consistent, review: results.findings.length, report: "coverage/audit/historical-factoring.json" }));
} catch (error) {
  // No registrar opciones de conexión, SQL ni errores del driver con datos sensibles.
  console.error("Auditoría no completada.", error.code ?? error.name);
  process.exitCode = 1;
} finally { await connection?.end(); }
