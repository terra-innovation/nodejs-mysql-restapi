import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import dotenv from "dotenv";
import mariadb from "mariadb";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const baselinePath = path.join(root, "tests/mariadb/schema/baseline.json");
export const image = "mariadb:11.4.10";
export const label = "ft.backend.integration.run";
export const guardTable = "__ft_integration_guard";

export function connectionOptions(value) {
  const url = new URL(value);
  if (url.protocol !== "mysql:") throw new Error("Se requiere una URL Prisma de MariaDB (mysql://).");
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!database || database.includes("/") || !url.username) throw new Error("URL de base de datos incompleta.");
  if ([...url.searchParams.keys()].some(key => !["connection_limit", "pool_timeout", "connect_timeout", "socket_timeout", "timezone"].includes(key))) {
    throw new Error("La URL contiene opciones no soportadas por el exportador; revisar SSL/socket antes de continuar.");
  }
  return { host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password), database, connectTimeout: 5000,
    ...(url.searchParams.has("timezone") ? { timezone: url.searchParams.get("timezone") } : {}) };
}

export function assertTestTarget(value, runId) {
  const options = connectionOptions(value);
  if (!/^[a-f0-9]{24}$/.test(runId ?? "") ||
      !["127.0.0.1", "localhost"].includes(options.host) ||
      options.database !== `ft_integration_${runId}` ||
      options.user !== "ft_test" || options.port <= 1024 || options.port === 3306) {
    throw new Error("Destino rechazado: solo se permite la MariaDB desechable creada para esta ejecución.");
  }
  return options;
}

export function assertOwnedContainer(name, runId, actualLabel) {
  if (!/^[a-f0-9]{24}$/.test(runId ?? "") || name !== `ft-backend-it-${runId}` || actualLabel !== runId) {
    throw new Error("Contenedor ajeno: limpieza rechazada.");
  }
}
export function testArguments(args) {
  for (let index = 0; index < args.length; index++) {
    if (["-t", "--testNamePattern"].includes(args[index]) && args[index + 1]) { index++; continue; }
    if (!/^tests\/mariadb\/[a-zA-Z0-9_-]+\.test\.ts$/.test(args[index])) {
      throw new Error("Solo se admiten archivos de tests/mariadb/ y -t/--testNamePattern; no se permite cambiar la configuración.");
    }
  }
  return args;
}

export function quoteIdentifier(value) { return `\`${String(value).replaceAll("\`", "\`\`")}\``; }
export function schemaHash(tables) { return createHash("sha256").update(JSON.stringify(tables)).digest("hex"); }
export function validateBaseline(value) {
  if (value?.formatVersion !== 1 || value.engine !== "MariaDB" || !value.sourceVersion?.includes("MariaDB") ||
      !/^[a-z0-9_]+$/i.test(value.charset ?? "") || !/^[a-z0-9_]+$/i.test(value.collation ?? "") ||
      !/^[A-Z_,]*$/.test(value.sqlMode ?? "") || !Array.isArray(value.tables) || !value.tables.length) {
    throw new Error("Estructura inicial inválida.");
  }
  const names = new Set();
  for (const table of value.tables) {
    if (!/^[a-z0-9_]+$/i.test(table.name ?? "") || names.has(table.name) ||
        !table.sql?.startsWith(`CREATE TABLE ${quoteIdentifier(table.name)} (`)) throw new Error("DDL de tabla inválido.");
    names.add(table.name);
  }
  if (names.has(guardTable) || schemaHash(value.tables) !== value.sha256) throw new Error("Hash o tabla reservada inválidos.");
  return value;
}
export async function loadBaseline() { return validateBaseline(JSON.parse(await readFile(baselinePath, "utf8"))); }
export async function developmentSource() {
  // Parsear el archivo explícito: no cargar variables ni credenciales de producción.
  const values = dotenv.parse(await readFile(path.join(root, ".env.development")));
  return connectionOptions(values.PRISMA_DATABASE_FACTORING_URL);
}
export async function connect(options) { return mariadb.createConnection(options); }
export async function inventory(connection) {
  const objects = await connection.query(`SELECT
    (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE<>'BASE TABLE') AS views,
    (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE()) AS triggers,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE()) AS routines,
    (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA=DATABASE()) AS events,
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_SCHEMA<>DATABASE()) AS externalReferences`);
  return Object.fromEntries(Object.entries(objects[0]).map(([key, value]) => [key, Number(value)]));
}
export async function tableDefinitions(connection) {
  const rows = await connection.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const tables = [];
  for (const row of rows) {
    const result = await connection.query(`SHOW CREATE TABLE ${quoteIdentifier(row.name)}`);
    // Quitar solo el contador de la opción final, nunca columnas/defaults/comentarios.
    const sql = result[0]["Create Table"].replace(/(\) ENGINE=[^\n]*?) AUTO_INCREMENT=\d+(?= |$)/, "$1");
    tables.push({ name: row.name, sql });
  }
  return tables;
}

export function command(executable, args, { env = process.env, input, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: root, env, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"], signal });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
    child.on("error", error => reject(new Error(executable === "docker" ? "Docker no está disponible. Instala/inicia Docker con contenedores Linux." : `No se pudo iniciar ${path.basename(executable)} (${error.code ?? "ERROR"}).`)));
    child.on("close", code => code === 0 ? resolve(stdout.trim()) : reject(new Error(`${path.basename(executable)} falló (${code}). ${stderr.includes("daemon") ? "Comprueba que Docker esté iniciado." : "Revisar requisitos o ejecutar el comando de diagnóstico."}`)));
    child.stdin.on("error", () => {}); // El proceso puede cerrar stdin antes de terminar.
    child.stdin.end(input);
  });
}
export async function dockerReady() {
  await command("docker", ["version", "--format", "{{.Server.Version}}"]);
  await command("docker", ["info", "--format", "{{.OSType}}"]).then(os => {
    if (os !== "linux") throw new Error("Se requieren contenedores Linux para MariaDB.");
  });
}
export async function writeReport(name, value) {
  const destination = path.join(root, "coverage/mariadb");
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, name), JSON.stringify(value, null, 2) + "\n");
}
