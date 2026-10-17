import mariadb from "mariadb";
import { ClientError } from "#src/utils/CustomErrors.js";
import { storedOptions } from "#src/integrations/bbdd/mysqlConnection.js";
import type { DatabaseConfig } from "#src/integrations/bbdd/mysqlConnection.js";
import type { RemoteRow } from "#src/domain/banca/transaccionBancaria.Policy.js";
export interface SourceConfig extends DatabaseConfig {
  tabla_origen: string;
}
export const sqlIdentifier = (value: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(value)) throw new ClientError("Nombre de base o tabla no permitido.", 422);
  return `\`${value}\``;
};
export async function sourceOptions(config: SourceConfig) {
  sqlIdentifier(config.tabla_origen);
  return storedOptions(config);
}
export async function readSource(config: SourceConfig, accounts: string[], from: string | null, to: string | null, historical = false): Promise<RemoteRow[]> {
  const options = await sourceOptions(config);
  let connection: Awaited<ReturnType<typeof mariadb.createConnection>>;
  try {
    connection = await mariadb.createConnection(options);
    await connection.query("SET SESSION time_zone = '+00:00'");
    // Los permisos de la cuenta los administra el responsable del origen.
    // El consumidor solo ejecuta SELECT dentro de una transacción de lectura.
    await connection.query("SET TRANSACTION READ ONLY");
    await connection.beginTransaction();
    const legacyFields = historical ? ", tipooperacion, detalle_fecha, detalle_hora, origen_cuenta, origen_nombre, CAST(origen_comision AS CHAR) AS origen_comision, destino_cuenta, destino_nombre, CAST(destino_comision AS CHAR) AS destino_comision, CAST(monto_neto AS CHAR) AS monto_neto, referencia_descripcion, referencia_proveedor_ruc, referencia_proveedor_factura, referencia_proveedor_boleta, referencia_ft_factura, referencia_ft_op_factoring" : "";
    const limit = Number(process.env.BANK_SYNC_MAX_ROWS || 50000);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100000 || !accounts.length) throw new ClientError("Alcance de lectura inválido.", 422);
    const sql = `SELECT cuenta, numerooperacion, CAST(fecha AS CHAR) AS fecha, descripcion, sumaoresta, moneda, CAST(monto AS CHAR) AS monto${legacyFields} FROM ${sqlIdentifier(config.tabla_origen)} WHERE TRIM(REPLACE(REPLACE(cuenta, CHAR(13), ''), CHAR(10), '')) IN (${accounts.map(() => "?").join(",")})${from ? " AND fecha >= ? AND fecha <= ?" : ""} ORDER BY cuenta, fecha, numerooperacion, descripcion, monto LIMIT ?`;
    const rows = (await connection.query(sql, [...accounts, ...(from ? [from, to] : []), limit + 1])) as RemoteRow[];
    if (rows.length > limit) throw new ClientError("El alcance excede el límite seguro; seleccione un período menor.", 422);
    await connection.commit();
    return rows;
  } catch (error) {
    if (error instanceof ClientError) throw error;
    throw new ClientError("No se pudo leer MySQL remoto. Revise conexión, TLS, contrato de columnas y permisos SELECT.", 502);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}

// Contrato explícito de la fuente bancaria. Nunca acepta SQL ni columnas del navegador.
export const sourceColumns = ["cuenta", "numerooperacion", "fecha", "descripcion", "sumaoresta", "moneda", "monto", "tipooperacion", "detalle_fecha", "detalle_hora", "origen_cuenta", "origen_nombre", "origen_comision", "destino_cuenta", "destino_nombre", "destino_comision", "monto_neto", "referencia_descripcion", "referencia_proveedor_ruc", "referencia_proveedor_factura", "referencia_proveedor_boleta", "referencia_ft_factura", "referencia_ft_op_factoring", "fechacrea", "fechamod", "estado"] as const;
export interface SourcePageQuery {
  desde: string;
  hasta: string;
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  desc?: boolean;
}
export async function browseSource(config: SourceConfig, query: SourcePageQuery) {
  if (!query.desde || !query.hasta || query.desde > query.hasta || !Number.isInteger(query.page) || query.page < 1 || !Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100) throw new ClientError("Seleccione un rango de fechas válido.", 422);
  const sort = query.sortBy || "fecha";
  if (!(sourceColumns as readonly string[]).includes(sort)) throw new ClientError("Columna de orden no permitida.", 422);
  const options = await sourceOptions(config);
  let connection: Awaited<ReturnType<typeof mariadb.createConnection>> | undefined;
  try {
    connection = await mariadb.createConnection(options);
    await connection.query("SET SESSION time_zone = '+00:00'");
    await connection.query("SET TRANSACTION READ ONLY");
    await connection.beginTransaction();
    const metadata = (await connection.query("SELECT COLUMN_NAME AS nombre, DATA_TYPE AS tipo FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [config.base_datos, config.tabla_origen])) as { nombre: string; tipo: string }[];
    const types = new Map(metadata.map((col) => [col.nombre, col.tipo.toLowerCase()]));
    const fields = sourceColumns
      .map((name) => {
        const column = sqlIdentifier(name);
        return ["decimal", "date", "datetime", "timestamp", "time"].includes(types.get(name) || "") ? `CAST(${column} AS CHAR) AS ${column}` : column;
      })
      .join(", ");
    const searchColumns = ["cuenta", "numerooperacion", "descripcion", "referencia_descripcion"];
    const where = `fecha >= ? AND fecha <= ?${query.search ? ` AND (${searchColumns.map((name) => `LOCATE(?, ${sqlIdentifier(name)}) > 0`).join(" OR ")})` : ""}`;
    const params = [query.desde, query.hasta, ...(query.search ? searchColumns.map(() => query.search) : [])];
    const table = sqlIdentifier(config.tabla_origen);
    const counts = (await connection.query(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params)) as { total: bigint | number }[];
    // La clave compuesta original desempata de forma estable entre páginas.
    const tie = ["cuenta", "numerooperacion", "fecha", "descripcion", "monto"]
      .filter((name) => name !== sort)
      .map(sqlIdentifier)
      .join(", ");
    const rows = (await connection.query(`SELECT ${fields} FROM ${table} WHERE ${where} ORDER BY ${sqlIdentifier(sort)} ${query.desc === false ? "ASC" : "DESC"}, ${tie} LIMIT ? OFFSET ?`, [...params, query.limit, (query.page - 1) * query.limit])) as Record<string, unknown>[];
    const items = rows.map((row) =>
      Object.fromEntries(
        sourceColumns.map((name) => {
          const value = row[name];
          // Solo TIMESTAMP tiene zona determinada por la sesión UTC.
          // DATETIME se conserva literal: no conocemos la zona con que se grabó.
          const instant = types.get(name) === "timestamp";
          return [name, instant && typeof value === "string" ? `${value.replace(" ", "T")}Z` : value];
        }),
      ),
    );
    await connection.commit();
    return { items, total: Number(counts[0]?.total || 0), tipos: Object.fromEntries(types), zona_sesion: "UTC", zona_transferencia: "UTC solo para TIMESTAMP; DATETIME sin zona" };
  } catch (error) {
    if (error instanceof ClientError) throw error;
    throw new ClientError("No se pudo consultar el origen. Revise conexión, permisos SELECT y columnas de la tabla bancaria.", 502);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}
