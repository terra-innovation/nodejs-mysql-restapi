import { randomBytes } from "node:crypto";
import path from "node:path";
import { spawn } from "node:child_process";
import { root, image, label, guardTable, command, dockerReady, loadBaseline, connect, assertTestTarget, assertOwnedContainer, quoteIdentifier, writeReport, testArguments } from "./mariadb-common.mjs";

const runId = randomBytes(12).toString("hex");
const container = `ft-backend-it-${runId}`;
const database = `ft_integration_${runId}`;
const password = randomBytes(24).toString("hex");
const rootPassword = randomBytes(24).toString("hex");
const abort = new AbortController();
const stop = () => abort.abort();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
const report = { runId, image, startedAt: new Date().toISOString(), status: "preparing", cleanup: "not-created" };
let attempted = false;
let connection;
let failure;
try {
  const filters = testArguments(process.argv.slice(2));
  const baseline = await loadBaseline();
  await dockerReady();
  report.schemaHash = baseline.sha256;
  report.tables = baseline.tables.length;
  report.sourceVersion = baseline.sourceVersion;
  console.log(`Preparando ${image} con ${baseline.tables.length} tablas. No se consulta desarrollo.`);
  attempted = true;
  await command("docker", ["run", "--detach", "--name", container, "--label", `${label}=${runId}`,
    "--publish", "127.0.0.1::3306", "--tmpfs", "/var/lib/mysql",
    "--env", "MARIADB_ROOT_PASSWORD", "--env", "MARIADB_DATABASE", "--env", "MARIADB_USER", "--env", "MARIADB_PASSWORD",
    "--health-cmd", "healthcheck.sh --connect --innodb_initialized", "--health-interval", "1s", "--health-start-period", "5s", "--health-retries", "60",
    image, "--event-scheduler=OFF", "--default-time-zone=+00:00", `--character-set-server=${baseline.charset}`,
    `--collation-server=${baseline.collation}`, `--sql-mode=${baseline.sqlMode}`],
    { env: { ...process.env, MARIADB_ROOT_PASSWORD: rootPassword, MARIADB_DATABASE: database, MARIADB_USER: "ft_test", MARIADB_PASSWORD: password }, signal: abort.signal });
  report.cleanup = "pending";
  for (let attempt = 0; ; attempt++) {
    if (abort.signal.aborted) throw new Error("Ejecución interrumpida.");
    const state = await command("docker", ["inspect", "--format", "{{.State.Health.Status}}", container]);
    if (state === "healthy") break;
    if (state === "unhealthy" || attempt >= 90) throw new Error("MariaDB no alcanzó un estado saludable.");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const ports = JSON.parse(await command("docker", ["inspect", "--format", "{{json .NetworkSettings.Ports}}", container]));
  const binding = ports["3306/tcp"]?.find(item => item.HostIp === "127.0.0.1");
  if (!binding) throw new Error("MariaDB no está publicada exclusivamente en localhost.");
  const url = `mysql://ft_test:${password}@127.0.0.1:${binding.HostPort}/${database}`;
  const options = assertTestTarget(url, runId);
  connection = await connect(options);
  await connection.query("SET FOREIGN_KEY_CHECKS=0");
  for (const table of baseline.tables) {
    if (abort.signal.aborted) throw new Error("Ejecución interrumpida.");
    await connection.query(table.sql);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS=1");
  await connection.query(`CREATE TABLE ${quoteIdentifier(guardTable)} (run_id VARCHAR(24) PRIMARY KEY, schema_hash CHAR(64) NOT NULL) ENGINE=InnoDB`);
  await connection.query(`INSERT INTO ${quoteIdentifier(guardTable)} VALUES (?, ?)`, [runId, baseline.sha256]);
  await connection.end(); connection = undefined;
  report.status = "testing";
  console.log("MariaDB lista. Ejecutando pruebas reales de entorno y negocio con Prisma.");
  const env = { ...process.env, NODE_ENV: "test", TZ: "UTC", FT_INTEGRATION_RUN_ID: runId, FT_INTEGRATION_DATABASE_URL: url, PRISMA_DATABASE_FACTORING_URL: url };
  const args = [path.join(root, "node_modules/vitest/vitest.mjs"), "run", "--config", "tests/mariadb/vitest.config.ts", ...filters];
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env, shell: false, windowsHide: true, stdio: "inherit", signal: abort.signal });
    child.on("error", () => reject(new Error("No se pudo ejecutar Vitest o la ejecución fue interrumpida.")));
    child.on("close", code => resolve(code ?? 1));
  });
  if (exitCode !== 0) throw new Error("Fallaron las comprobaciones de integración. Consultar coverage/mariadb/junit.xml.");
  report.status = "passed";
} catch (error) {
  failure = error.sqlState || error.code ? `Fallo de preparación SQL (${error.code ?? error.sqlState}).` : error.message;
  report.status = "failed";
  report.error = failure;
  process.exitCode = abort.signal.aborted ? 130 : 1;
} finally {
  if (connection) await connection.end().catch(() => {});
  if (attempted) {
    try {
      // No borrar por prefijo solamente: verificar el identificador de esta ejecución.
      const exists = await command("docker", ["container", "ls", "--all", "--quiet", "--filter", `name=^/${container}$`]);
      if (exists) {
        const actualLabel = await command("docker", ["inspect", "--format", `{{index .Config.Labels "${label}"}}`, container]);
        assertOwnedContainer(container, runId, actualLabel);
        await command("docker", ["rm", "--force", "--volumes", container]);
        report.cleanup = "removed";
      } else report.cleanup = "not-created";
    } catch {
      report.cleanup = "failed";
      process.exitCode = 1;
      console.error(`No se pudo verificar/eliminar el contenedor propio ${container}. Revisar Docker; no se eliminaron otros recursos.`);
    }
  }
  report.finishedAt = new Date().toISOString();
  await writeReport(`run-${runId}.json`, report);
  await writeReport("last-run.json", report);
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
  if (failure) console.error(failure);
  console.log("Resumen: coverage/mariadb/last-run.json");
}
