import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import dotenv from "dotenv";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const identifier = (value) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(value ?? "")) throw new MaintenanceError("Identificador SQL no permitido.");
  return `\`${value}\``;
};

// SQL deliberadamente acotado: sin procedimientos, DELIMITER ni comentarios ejecutables.
// Separar por ';' directamente rompería comentarios/valores como los de este DDL.
export function splitSql(sql) {
  const statements = [];
  let current = "", quote = null, comment = null;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i], next = sql[i + 1];
    if (comment === "line") {
      if (c === "\n") { comment = null; current += "\n"; }
      continue;
    }
    if (comment === "block") {
      if (c === "*" && next === "/") { comment = null; current += " "; i++; }
      continue;
    }
    if (quote) {
      if (c === "\\") throw new Error("Usar comillas duplicadas en SQL, sin escapes dependientes de sql_mode.");
      current += c;
      if (c === quote) {
        if (next === quote) { current += next; i++; } else quote = null;
      }
      continue;
    }
    if (c === "-" && next === "-" && /\s/.test(sql[i + 2] ?? "")) { comment = "line"; i++; continue; }
    if (c === "#") { comment = "line"; continue; }
    if (c === "/" && next === "*") {
      if (sql[i + 2] === "!" || sql[i + 2] === "+" || sql.slice(i, i + 4).toUpperCase() === "/*M!") {
        throw new Error("Comentarios ejecutables o directivas SQL no permitidos.");
      }
      comment = "block"; i++; continue;
    }
    if (["'", '"', "`"].includes(c)) { quote = c; current += c; continue; }
    if (c === ";") { if (current.trim()) statements.push(current.trim()); current = ""; }
    else current += c;
  }
  if (quote || comment === "block") throw new Error("SQL incompleto: comilla o comentario sin cerrar.");
  if (current.trim()) statements.push(current.trim());
  return statements;
}

export function describeStatements(statements, plan) {
  const create = new Set(plan.createTables ?? []), alter = new Set(plan.alterTables ?? []);
  const seeds = new Set(plan.seedTables ?? []), foundCreate = new Set(), foundAlter = new Set();
  for (const value of [...create, ...alter, ...seeds]) identifier(value);
  if ([...create].some((t) => alter.has(t)) || [...seeds].some((t) => !create.has(t))) {
    throw new Error("Las semillas solo se permiten en tablas nuevas; no mezclar creación y alteración de una tabla.");
  }
  const steps = statements.map((sql, index) => {
    let match = sql.match(/^CREATE\s+TABLE\s+`([a-z][a-z0-9_]*)`\s*\(/i);
    if (match) {
      if (!create.has(match[1]) || foundCreate.has(match[1])) throw new Error("CREATE fuera del alcance o duplicado.");
      foundCreate.add(match[1]);
      return { index: index + 1, kind: "create", table: match[1], sql };
    }
    match = sql.match(/^ALTER\s+TABLE\s+`([a-z][a-z0-9_]*)`\s+((?:ADD|MODIFY|CHANGE|DROP)\s)/i);
    if (match) {
      if (!alter.has(match[1]) || /\b(?:RENAME|EXCHANGE|DISCARD|IMPORT|TRUNCATE)\b/i.test(sql.replace(/'((?:''|[^'])*)'/g, ""))) {
        throw new Error("ALTER fuera del alcance o con operación no admitida.");
      }
      foundAlter.add(match[1]);
      return { index: index + 1, kind: "alter", table: match[1], sql };
    }
    match = sql.match(/^INSERT\s+INTO\s+`([a-z][a-z0-9_]*)`\s*\([^)]*\)\s*VALUES\s*\(/i);
    if (match && seeds.has(match[1]) && foundCreate.has(match[1])) {
      return { index: index + 1, kind: "seed", table: match[1], sql };
    }
    throw new Error(`Sentencia ${index + 1} no permitida: solo CREATE/ALTER declarados y semillas de tablas nuevas.`);
  });
  if (!steps.length || create.size !== foundCreate.size || alter.size !== foundAlter.size) throw new Error("El SQL no coincide con todas las tablas declaradas.");
  return steps;
}

export async function workspaceFile(value, base = root) {
  const resolved = await realpath(path.resolve(base, value));
  const relative = path.relative(await realpath(root), resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Archivo fuera del repositorio.");
  return resolved;
}

export async function loadPlan(file) {
  const planPath = await workspaceFile(file);
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  if (plan.formatVersion !== 1 || !/^[a-z0-9-]+$/.test(plan.id ?? "") || typeof plan.sqlFile !== "string") throw new Error("Manifiesto DDL inválido.");
  const sqlPath = await workspaceFile(plan.sqlFile, path.dirname(planPath));
  const sql = await readFile(sqlPath, "utf8");
  const steps = describeStatements(splitSql(sql), plan);
  const digest = sha256(JSON.stringify({ plan, sqlSha256: sha256(sql) }));
  return { plan, sql, sqlPath, planPath, steps, digest };
}

export async function readDevelopmentTarget(envPath = path.join(root, ".env.development")) {
  const bytes = await readFile(envPath);
  const values = dotenv.parse(bytes);
  let url;
  try { url = new URL(values.PRISMA_DATABASE_FACTORING_URL); } catch { throw new Error("Falta una URL MariaDB válida en .env.development."); }
  if (url.protocol !== "mysql:" || !url.username || !url.pathname.slice(1)) throw new Error("URL de desarrollo incompleta o protocolo no permitido.");
  const allowed = new Set(["connection_limit", "pool_timeout", "connect_timeout", "socket_timeout", "timezone"]);
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) throw new Error("Opciones de conexión no soportadas; revisar SSL/socket sin descartar opciones silenciosamente.");
  const database = decodeURIComponent(url.pathname.slice(1));
  if (database.includes("/")) throw new Error("Nombre de base de desarrollo inválido.");
  const options = {
    host: url.hostname, port: Number(url.port || 3306), database,
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    charset: "utf8mb4", connectTimeout: 8000, socketTimeout: 30000, multipleStatements: false,
    ...(url.searchParams.has("timezone") ? { timezone: url.searchParams.get("timezone") } : {}),
  };
  return {
    options, url: values.PRISMA_DATABASE_FACTORING_URL, envSha256: sha256(bytes),
    fingerprint: sha256(JSON.stringify({ host: options.host, port: options.port, database })),
  };
}

export function assertApplyAuthorization(args, digest, fingerprint) {
  if (!args.apply) return;
  if (args["expected-plan"] !== digest || args["expected-target"] !== fingerprint || !args.authorization?.trim()) {
    throw new Error("Aplicación rechazada: se necesitan hash del plan, huella del destino y referencia de autorización expresa.");
  }
}

export function safeError(error) {
  // Nunca publicar mensajes del driver: pueden incluir host, usuario, SQL o contraseña.
  if (error?.code || error?.sqlState) return `Error de conexión/SQL (${String(error.code ?? error.sqlState).replace(/[^A-Z0-9_]/gi, "")}).`;
  return error instanceof MaintenanceError ? error.message : "Error de mantenimiento; revisar el paso y el informe seguro.";
}
export class MaintenanceError extends Error {}

export function redact(text, target) {
  let result = String(text).replace(/(?:mysql|mariadb):\/\/[^\s"'<>]+/gi, "[URL omitida]");
  const values = [target.url, target.options.password, target.options.user, target.options.host, target.options.database].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const value of values) result = result.split(value).join("[omitido]");
  return result;
}

export function expectedComments(sql) {
  const columns = [...sql.matchAll(/^\s*`([^`]+)`[^\n]*?\bCOMMENT\s+'((?:''|[^'])*)'/gm)].map((m) => ({ name: m[1], comment: m[2].replaceAll("''", "'") }));
  const table = sql.match(/\)\s*ENGINE[^\n]*\bCOMMENT\s*=\s*'((?:''|[^'])*)'\s*$/i);
  return { columns, table: table?.[1].replaceAll("''", "'") };
}
