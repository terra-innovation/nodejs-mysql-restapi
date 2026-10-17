import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import mariadb from "mariadb";
import { root, sha256, identifier, loadPlan, readDevelopmentTarget, assertApplyAuthorization, expectedComments, redact, safeError, MaintenanceError } from "./maintenance-core.mjs";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  if (["--apply", "--prisma-sync"].includes(key)) args[key.slice(2)] = true;
  else if (["--plan", "--expected-plan", "--expected-target", "--authorization"].includes(key) && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) args[key.slice(2)] = process.argv[++i];
  else throw new MaintenanceError("Argumento desconocido o incompleto.");
}

let connection,
  locked = false,
  target,
  loaded;
const report = { startedAt: new Date().toISOString(), status: "preparing", source: ".env.development", steps: [] };
const reportDir = path.join(root, "docs/registros/bbdd");
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const reportPath = path.join(reportDir, `${runId}-ddl.json`);
async function save() {
  await mkdir(reportDir, { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2) + "\n");
}
async function schemaDigests() {
  const rows = await connection.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const hashes = {};
  for (const row of rows) {
    const [ddl] = await connection.query(`SHOW CREATE TABLE ${identifier(row.name)}`);
    const normalized = ddl["Create Table"].replace(/(\) ENGINE=[^\n]*?) AUTO_INCREMENT=\d+(?= |$)/, "$1");
    hashes[row.name] = sha256(normalized);
  }
  return hashes;
}
async function verifyCreated() {
  const verification = [];
  for (const step of loaded.steps.filter((s) => s.kind === "create")) {
    const comments = expectedComments(step.sql);
    const [table] = await connection.query("SELECT TABLE_COMMENT AS comment FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?", [step.table]);
    const columns = await connection.query("SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS defaultValue, COLUMN_COMMENT AS comment FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [step.table]);
    if (!comments.table || table?.comment !== comments.table || columns.length !== comments.columns.length || columns.some((c, i) => c.name !== comments.columns[i].name || c.comment !== comments.columns[i].comment)) {
      throw new MaintenanceError(`Comentarios/columnas no coinciden en ${step.table}.`);
    }
    const fks = await connection.query("SELECT k.CONSTRAINT_NAME AS name,k.COLUMN_NAME AS columnName,k.REFERENCED_TABLE_NAME AS referencedTable,k.REFERENCED_COLUMN_NAME AS referencedColumn,r.UPDATE_RULE AS updateRule,r.DELETE_RULE AS deleteRule FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.TABLE_NAME=k.TABLE_NAME AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME WHERE k.TABLE_SCHEMA=DATABASE() AND k.TABLE_NAME=? AND k.REFERENCED_TABLE_NAME IS NOT NULL ORDER BY k.CONSTRAINT_NAME,k.ORDINAL_POSITION", [step.table]);
    const expectedFks = [...step.sql.matchAll(/CONSTRAINT\s+`([^`]+)`\s+FOREIGN KEY\s*\(`([^`]+)`\)\s+REFERENCES\s+`([^`]+)`\s*\(`([^`]+)`\)\s+ON DELETE RESTRICT ON UPDATE RESTRICT/gi)];
    if (fks.length !== expectedFks.length || expectedFks.some((m) => !fks.some((fk) => fk.name === m[1] && fk.columnName === m[2] && fk.referencedTable === m[3] && fk.referencedColumn === m[4] && fk.updateRule === "RESTRICT" && fk.deleteRule === "RESTRICT"))) throw new MaintenanceError(`Relaciones no coinciden en ${step.table}.`);
    const indexes = await connection.query("SELECT INDEX_NAME AS name,NON_UNIQUE AS nonUnique,GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columnsList FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? GROUP BY INDEX_NAME,NON_UNIQUE ORDER BY INDEX_NAME", [step.table]);
    for (const m of step.sql.matchAll(/(?:UNIQUE KEY|KEY)\s+`([^`]+)`\s*\(([^)]+)\)/g)) {
      const cols = [...m[2].matchAll(/`([^`]+)`/g)].map((x) => x[1]).join(",");
      const unique = m[0].startsWith("UNIQUE");
      if (!indexes.some((ix) => ix.name === m[1] && ix.columnsList === cols && Number(ix.nonUnique) === (unique ? 0 : 1))) throw new MaintenanceError(`Índice no coincide en ${step.table}.`);
    }
    verification.push({ table: step.table, columns: columns.length, commentsExact: true, foreignKeys: fks.length, columnsMetadata: columns, indexes, foreignKeysMetadata: fks });
  }
  for (const check of loaded.plan.seedChecks ?? []) {
    if (!(loaded.plan.seedTables ?? []).includes(check.table)) throw new MaintenanceError("Verificación de semillas fuera del alcance.");
    const columns = check.columns.map(identifier).join(",");
    const rows = await connection.query(`SELECT ${columns} FROM ${identifier(check.table)} ORDER BY ${identifier(check.columns[0])}`);
    const actual = rows.map((row) => check.columns.map((c) => (typeof row[c] === "bigint" ? Number(row[c]) : row[c])));
    if (JSON.stringify(actual) !== JSON.stringify(check.rows)) throw new MaintenanceError(`Semillas no coinciden en ${check.table}.`);
  }
  return verification;
}

try {
  if (!args.plan || (args["prisma-sync"] && !args.apply)) throw new MaintenanceError("Usar --plan; --prisma-sync requiere --apply. Sin --apply solo se revisa.");
  if (process.version !== "v24.21.0") throw new MaintenanceError("Este mantenimiento requiere Node portable 24.21.0 del proyecto.");
  loaded = await loadPlan(args.plan);
  target = await readDevelopmentTarget();
  assertApplyAuthorization(args, loaded.digest, target.fingerprint);
  Object.assign(report, { plan: loaded.plan.id, mode: args.apply ? "apply" : "preview", planSha256: loaded.digest, sqlSha256: sha256(loaded.sql), targetSha256: target.fingerprint, authorizationRef: args.apply ? args.authorization : null });
  connection = await mariadb.createConnection(target.options);
  const [server] = await connection.query("SELECT VERSION() AS version,DATABASE() AS selectedDatabase,@@read_only AS readOnly");
  if (!server.version.includes("MariaDB") || server.selectedDatabase !== target.options.database || (args.apply && Number(server.readOnly) !== 0)) throw new MaintenanceError("Destino no coincide o no permite el mantenimiento previsto.");
  report.serverVersion = server.version;
  if (args.apply) {
    const [lock] = await connection.query("SELECT GET_LOCK(?,10) AS acquired", [`ft:ddl:${target.fingerprint.slice(0, 32)}`]);
    if (Number(lock.acquired) !== 1) throw new MaintenanceError("Otro mantenimiento está en curso.");
    locked = true;
    await connection.query("SET SESSION time_zone='+00:00'");
  } else await connection.query("SET SESSION TRANSACTION READ ONLY");
  const before = await schemaDigests();
  const renames = loaded.plan.renameTables ?? [];
  for (const pair of renames) if (!before[pair.from] || before[pair.to]) throw new MaintenanceError("Origen o destino de renombre incompatible.");
  for (const table of loaded.plan.createTables ?? []) if (before[table]) throw new MaintenanceError(`La tabla ${table} ya existe; no se reemplaza ni se ignora.`);
  for (const table of loaded.plan.alterTables ?? []) if (!before[table] && !renames.some((p) => p.to === table)) throw new MaintenanceError(`La tabla ${table} no existe para ALTER.`);
  const referenced = [...loaded.sql.matchAll(/REFERENCES\s+`([^`]+)`\s*\(`([^`]+)`\)/g)].map((m) => ({ table: m[1], column: m[2] }));
  for (const ref of referenced) {
    if ((loaded.plan.createTables ?? []).includes(ref.table)) continue;
    const previous = (loaded.plan.referenceRenames ?? []).find((p) => p.table === ref.table && p.column === ref.column);
    const [column] = await connection.query("SELECT COLUMN_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?", [previous?.fromTable ?? ref.table, previous?.fromColumn ?? ref.column]);
    if (!column || !/^int\b.*unsigned$/i.test(column.type)) throw new MaintenanceError(`Referencia existente incompatible: ${ref.table}.${ref.column}.`);
  }
  report.beforeSchemaHashes = before;
  report.proposedSteps = loaded.steps.map(({ index, kind, table }) => ({ index, kind, table }));
  await save();
  console.log(`Destino leído exclusivamente de .env.development. Plan: ${loaded.plan.id}.`);
  console.log(`SHA256 plan: ${loaded.digest}\nSHA256 destino: ${target.fingerprint}`);
  console.log(`Alcance: ${loaded.plan.createTables.length} CREATE, ${(loaded.plan.alterTables ?? []).length} ALTER, ${loaded.steps.filter((s) => s.kind === "seed").length} semillas.`);
  if (!args.apply) {
    report.status = "previewed";
    console.log("Revisión terminada. Ninguna estructura o dato modificado.");
  } else {
    const currentTarget = await readDevelopmentTarget();
    const currentPlan = await loadPlan(args.plan);
    if (currentTarget.envSha256 !== target.envSha256 || currentPlan.digest !== loaded.digest) throw new MaintenanceError("Archivo de entorno o plan cambió después de la revisión.");
    report.status = "applying";
    await save();
    for (const step of loaded.steps) {
      report.currentStep = { index: step.index, kind: step.kind, table: step.table };
      await save();
      if (step.kind === "copy") {
        const [sourceCount] = await connection.query(`SELECT COUNT(*) AS n FROM ${identifier(step.source)}`);
        await connection.query(step.sql);
        const [copiedCount] = await connection.query(`SELECT COUNT(*) AS n FROM ${identifier(step.table)}`);
        if (String(sourceCount.n) !== String(copiedCount.n)) throw new MaintenanceError("La copia conservadora no preservó todas las filas.");
        report.steps.push({ ...report.currentStep, status: "completed", rowsPreserved: String(copiedCount.n) });
      } else {
        await connection.query(step.sql);
        report.steps.push({ ...report.currentStep, status: "completed" });
      }
      console.log(`Completado ${step.index}: ${step.kind} ${step.table}.`);
      await save();
    }
    report.verification = await verifyCreated();
    const after = await schemaDigests();
    const allowedAlter = new Set(loaded.plan.alterTables ?? []);
    for (const pair of renames) allowedAlter.add(pair.from);
    const changed = Object.keys(before).filter((name) => before[name] !== after[name] && !allowedAlter.has(name));
    const added = Object.keys(after)
      .filter((name) => !before[name])
      .sort();
    if (changed.length || JSON.stringify(added) !== JSON.stringify([...loaded.plan.createTables, ...renames.map((p) => p.to)].sort())) throw new MaintenanceError("Se detectó cambio de estructura fuera de las tablas autorizadas.");
    report.afterSchemaHashes = after;
    report.existingTablesUnchanged = true;
    report.status = "applied_and_verified";
    await save();
    console.log(`Verificado: ${report.verification.length} tablas, ${report.verification.reduce((n, t) => n + t.columns, 0)} columnas con comentarios exactos y relaciones/semillas correctas. Estructuras previas sin cambios.`);
    if (args["prisma-sync"]) {
      const sourceAgain = await readDevelopmentTarget();
      if (sourceAgain.envSha256 !== target.envSha256) throw new MaintenanceError(".env.development cambió; no sincronizar otro destino.");
      const npmCli = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
      const logPath = path.join(reportDir, `${runId}-prisma-sync.log`);
      report.prismaSync = { status: "running", log: path.relative(root, logPath).replaceAll("\\", "/") };
      await save();
      try {
        const result = await promisify(execFile)(process.execPath, [npmCli, "run", "prisma-sync"], {
          cwd: root,
          windowsHide: true,
          maxBuffer: 20 * 1024 * 1024,
          env: { ...process.env, NODE_ENV: "development", PRISMA_DATABASE_FACTORING_URL: target.url },
        });
        await writeFile(logPath, redact(result.stdout + "\n" + result.stderr, target));
        report.prismaSync.status = "completed";
        report.status = "completed";
        console.log("npm run prisma-sync completado sobre el mismo destino de .env.development.");
      } catch (error) {
        await writeFile(logPath, redact(String(error.stdout ?? "") + "\n" + String(error.stderr ?? ""), target));
        report.prismaSync.status = "failed";
        throw new MaintenanceError("DDL aplicado y verificado, pero prisma-sync falló; revisar registro sanitizado. No se revierte estructura automáticamente.");
      }
    }
  }
} catch (error) {
  report.status = report.steps.length ? "failed_after_changes" : "failed_before_changes";
  report.error = safeError(error);
  console.error(report.error);
  process.exitCode = 1;
} finally {
  if (connection) {
    if (locked) await connection.query("SELECT RELEASE_LOCK(?)", [`ft:ddl:${target.fingerprint.slice(0, 32)}`]).catch(() => {});
    await connection.end().catch(() => {});
  }
  report.finishedAt = new Date().toISOString();
  await save();
  console.log(`Informe: ${path.relative(root, reportPath).replaceAll("\\", "/")}`);
}
