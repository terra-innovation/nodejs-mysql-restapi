import mariadb from "mariadb";
import type { ConnectionConfig } from "mariadb";
import { readFile } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import { checkServerIdentity } from "node:tls";
import { performance } from "node:perf_hooks";
import { ClientError } from "#src/utils/CustomErrors.js";
import { descifrarPassword, verificarCifrado } from "#src/providers/bbdd/bbddCrypto.js";
import type { SecretEnvelope } from "#src/providers/bbdd/bbddCrypto.js";

export interface DatabaseConfig extends SecretEnvelope {
  configuracionbbddid: string;
  motor?: string;
  host: string;
  puerto: number;
  base_datos: string;
  usuario: string;
  tls_ca_referencia: string | null;
  tls_habilitado?: number | boolean;
}
export type ConnectionDraft = Pick<DatabaseConfig, "host" | "puerto" | "base_datos" | "usuario" | "tls_ca_referencia" | "motor" | "tls_habilitado"> & { password?: string };
export async function connectionOptions(config: ConnectionDraft, password: string): Promise<ConnectionConfig> {
  let targets: unknown, files: Record<string, string>;
  try {
    targets = JSON.parse(process.env.BBDD_ALLOWED_TARGETS ?? process.env.BANK_SYNC_ALLOWED_TARGETS ?? "[]");
    files = JSON.parse(process.env.BBDD_CA_FILES ?? process.env.BANK_SYNC_CA_FILES ?? "{}");
  } catch {
    throw new ClientError("Corrija el JSON de BBDD_ALLOWED_TARGETS y BBDD_CA_FILES en el servidor.", 503);
  }
  if (!Array.isArray(targets) || !targets.includes(`${config.host.toLowerCase()}:${config.puerto}`)) throw new ClientError("Destino no autorizado. Agregue este servidor:puerto a BBDD_ALLOWED_TARGETS en el backend y vuelva a probar.", 422);
  if (config.motor && !["MYSQL", "MARIADB"].includes(config.motor)) throw new ClientError("Motor no soportado por este adaptador. Seleccione MySQL o MariaDB.", 422);
  let ca: Buffer | undefined;
  const tlsEnabled = config.tls_habilitado !== false && config.tls_habilitado !== 0;
  if (tlsEnabled && config.tls_ca_referencia) {
    const file = files?.[config.tls_ca_referencia];
    if (typeof file !== "string" || !file) throw new ClientError("La referencia CA no existe en BBDD_CA_FILES. Configure su certificado en el backend o deje el campo vacío para usar las CA del sistema.", 422);
    try {
      ca = await readFile(file);
    } catch {
      throw new ClientError("No se pudo leer el certificado CA. Revise la ruta y los permisos del archivo configurado en BBDD_CA_FILES.", 503);
    }
  }
  const ssl = { rejectUnauthorized: true, ...(ca ? { ca } : {}), checkServerIdentity: (_host: string, cert: Parameters<typeof checkServerIdentity>[1]) => checkServerIdentity(config.host, cert) };
  return { host: config.host, port: config.puerto, database: config.base_datos || undefined, user: config.usuario, password, ssl: tlsEnabled ? ssl : false, connectTimeout: 8000, socketTimeout: 15000, queryTimeout: 10000, multipleStatements: false, dateStrings: true, decimalAsNumber: false, bigIntAsNumber: false, timezone: "+00:00" };
}
export const storedOptions = (config: DatabaseConfig) => connectionOptions(config, descifrarPassword(config, config.configuracionbbddid));

export interface Diagnostic {
  correcto: boolean;
  message: string;
  bases_datos: string[];
  log: string[];
  pasos: { paso: string; duracion_ms: number; resultado: "correcto" | "error" | "advertencia" }[];
  duracion_total_ms: number;
}
function actionable(error: unknown): string {
  if (error instanceof ClientError) return error.message;
  const messages: Record<string, string> = {
    ENOTFOUND: "No se encontró el servidor DNS. Revise el nombre del servidor y la resolución DNS desde el backend.",
    EAI_AGAIN: "La resolución DNS no respondió. Revise la conectividad DNS y vuelva a probar.",
    ECONNREFUSED: "El servidor rechazó la conexión. Verifique que MySQL/MariaDB esté iniciado, escuche en el puerto indicado y admita conexiones externas.",
    ETIMEDOUT: "Se agotó el tiempo de conexión. Revise VPN, firewall, ruta de red y puerto desde el servidor del backend.",
    ER_CONNECTION_TIMEOUT: "Se agotó el tiempo de conexión. Revise VPN, firewall, puerto y disponibilidad del servidor externo.",
    ER_ACCESS_DENIED_ERROR: "Autenticación rechazada. Revise usuario, contraseña y autorización de acceso desde la dirección del backend.",
    ER_BAD_DB_ERROR: "La base indicada no existe. Seleccione una de las bases detectadas o corrija su nombre manualmente.",
    ER_DBACCESS_DENIED_ERROR: "El usuario no tiene acceso a la base indicada. Seleccione una base accesible o ajuste los permisos en el servidor remoto.",
    ER_QUERY_TIMEOUT: "La consulta de diagnóstico excedió el tiempo permitido. Revise carga del servidor y latencia de red.",
    ER_SERVER_HANDSHAKE: "Falló la negociación con el servidor. Revise motor, puerto, versión y configuración TLS.",
    ER_HANDSHAKE_ERROR: "Falló la negociación con el servidor. Revise el motor, el puerto y la compatibilidad TLS.",
    ER_TLS_NOT_SUPPORTED: "El servidor no ofrece TLS. Habilite TLS en MySQL/MariaDB antes de utilizar esta conexión.",
    ER_SSL_NOT_SUPPORTED: "El servidor no ofrece TLS. Habilite TLS en MySQL/MariaDB antes de utilizar esta conexión.",
    ER_SERVER_SSL_DISABLED: "El servidor MySQL/MariaDB no ofrece TLS (SSL deshabilitado). Habilite TLS y configure el certificado del servidor remoto. Compruebe también que los otros clientes estén usando SSL/TLS: una conexión exitosa sin cifrado no verifica este requisito. La aplicación no reintenta enviando la contraseña sin cifrar.",
    ER_NODE_NOT_SUPPORTED_TLS: "La versión o configuración TLS del servidor no es compatible con este backend. Configure TLS 1.2 o superior y un certificado válido en el servidor remoto.",
    ER_TLS_IDENTITY_ERROR: "No se pudo verificar la identidad TLS del servidor. Revise el nombre DNS del certificado, su vigencia y la CA autorizada configurada en BBDD_CA_FILES.",
    ER_SOCKET_TIMEOUT: "Se agotó el tiempo de respuesta del servidor. Revise la red, el firewall y la carga del servidor remoto.",
    ER_SOCKET_UNEXPECTED_CLOSE: "El servidor cerró la conexión durante la comunicación. Revise los registros del servidor remoto, la negociación TLS, el método de autenticación y los límites de conexiones.",
    ERR_TLS_CERT_ALTNAME_INVALID: "El certificado TLS no corresponde al servidor indicado. Use el nombre incluido en el certificado o corrija el certificado remoto.",
    CERT_HAS_EXPIRED: "El certificado TLS ha vencido. Renueve el certificado del servidor remoto.",
    DEPTH_ZERO_SELF_SIGNED_CERT: "El certificado no tiene una CA confiable. Configure la CA autorizada en BBDD_CA_FILES y seleccione su referencia.",
    SELF_SIGNED_CERT_IN_CHAIN: "La cadena TLS incluye una CA no confiable. Configure el certificado CA autorizado en el backend.",
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: "No se pudo verificar la cadena TLS. Complete la cadena de certificados del servidor o configure su CA autorizada.",
    UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "Falta la CA emisora. Configure una referencia válida en BBDD_CA_FILES.",
  };
  // Algunos conectores envuelven el error TLS original en cause. Preferir la
  // causa específica conocida, sin publicar mensajes ni códigos no catalogados.
  const codes: string[] = [];
  const seen = new Set<object>();
  let current = error;
  for (let depth = 0; depth < 5 && current && typeof current === "object" && !seen.has(current); depth++) {
    seen.add(current);
    if ("code" in current && typeof current.code === "string" && Object.hasOwn(messages, current.code)) codes.push(current.code);
    current = "cause" in current ? current.cause : undefined;
  }
  const code = codes.at(-1);
  // Solo códigos de un catálogo conocido; nunca mensajes del driver, SQL ni credenciales.
  return code ? `${messages[code]} (${code})` : "Falló la comunicación con la BBDD. Revise conectividad, autenticación y TLS; contacte con infraestructura si el problema persiste.";
}

// Diagnóstico efímero: no usa DAO, logger, historial ni escrituras remotas.
export async function diagnoseConnection(resolve: () => Promise<{ config: ConnectionDraft; stored?: DatabaseConfig }>): Promise<Diagnostic> {
  const started = performance.now();
  const result: Diagnostic = { correcto: false, message: "", bases_datos: [], log: [], pasos: [], duracion_total_ms: 0 };
  const log = (message: string) => result.log.push(`[${((performance.now() - started) / 1000).toFixed(3)}s] ${message}`);
  const step = async <T>(name: string, work: () => Promise<T> | T, warning = false): Promise<T | undefined> => {
    const start = performance.now();
    log(`${name}: iniciando.`);
    try {
      const value = await work();
      result.pasos.push({ paso: name, duracion_ms: Number((performance.now() - start).toFixed(2)), resultado: "correcto" });
      log(`${name}: completado.`);
      return value;
    } catch (error) {
      result.pasos.push({ paso: name, duracion_ms: Number((performance.now() - start).toFixed(2)), resultado: warning ? "advertencia" : "error" });
      log(`${name}: ${actionable(error)}`);
      if (!warning) throw error;
    }
  };
  let connection: Awaited<ReturnType<typeof mariadb.createConnection>> | undefined;
  try {
    const resolved = (await step("Preparación de la configuración", resolve))!;
    await step("Disponibilidad del cifrado para guardar contraseñas", verificarCifrado, true);
    const password = (await step("Preparación de credenciales", () => {
      if (resolved.config.password) return resolved.config.password;
      if (resolved.stored) return descifrarPassword(resolved.stored, resolved.stored.configuracionbbddid);
      throw new ClientError("Introduzca una contraseña para probar una configuración nueva. Al editar, deje el campo vacío para utilizar la contraseña guardada.", 422);
    }))!;
    const options = (await step("Política de destinos y certificados TLS", () => connectionOptions(resolved.config, password)))!;
    if (options.ssl === false)
      await step(
        "Seguridad del transporte",
        () => {
          throw new ClientError("TLS desactivado explícitamente en esta configuración. La contraseña y los datos pueden viajar sin cifrar. El cifrado GCM de almacenamiento permanece activo.", 422);
        },
        true,
      );
    await step("Resolución DNS desde el backend", () =>
      Promise.race([
        lookup(resolved.config.host).then(() => undefined),
        new Promise<never>((_, reject) => {
          const timer = setTimeout(() => reject(Object.assign(new Error(), { code: "ETIMEDOUT" })), 8000);
          timer.unref();
        }),
      ]),
    );
    // El driver negocia TCP, TLS y autenticación juntos; no inventar tiempos separados.
    connection = (await step(options.ssl === false ? "Conexión TCP y autenticación sin TLS" : "Conexión TCP, negociación TLS y autenticación", () => mariadb.createConnection({ ...options, database: undefined })))!;
    await step("Consulta de bases accesibles", async () => {
      const rows = await connection!.query("SHOW DATABASES");
      result.bases_datos = rows.map((row: Record<string, unknown>) => String(row.Database)).sort();
      log(`Se encontraron ${result.bases_datos.length} bases accesibles. Puede seleccionar una o escribir el nombre manualmente.`);
    });
    if (resolved.config.base_datos) await step("Acceso a la base seleccionada", () => connection!.query(`USE ${connection!.escapeId(resolved.config.base_datos)}`).then(() => undefined));
    result.correcto = true;
    result.message = options.ssl === false ? "Conexión y acceso verificados sin TLS. Advertencia: contraseña y datos pueden viajar sin cifrar." : result.pasos.some((p) => p.resultado === "advertencia") ? "Conexión verificada. Hay advertencias de configuración que debe resolver antes de guardar una contraseña nueva." : "Conexión y acceso verificados correctamente.";
  } catch (error) {
    result.message = actionable(error);
  } finally {
    if (connection) await step("Cierre de la conexión", () => connection!.end(), true);
    result.duracion_total_ms = Number((performance.now() - started).toFixed(2));
    log(result.correcto ? "Prueba finalizada." : "Prueba finalizada con errores. Revise el paso señalado.");
  }
  return result;
}
