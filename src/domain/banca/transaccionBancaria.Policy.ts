import { createHash } from "node:crypto";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { ClientError } from "#src/utils/CustomErrors.js";

export const referencias = ["tipo_operacion", "origen_cuenta", "origen_nombre", "destino_cuenta", "destino_nombre", "referencia_descripcion", "referencia_proveedor_ruc", "referencia_proveedor_factura", "referencia_proveedor_boleta", "referencia_ft_factura", "referencia_ft_op_factoring"] as const;
export type RemoteRow = Record<string, unknown>;
export const limpiar = (value: unknown) =>
  String(value ?? "")
    .replace(/[\r\n]/g, "")
    .trim();
export function fechaCivil(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new ClientError("Fecha bancaria inválida.", 422);
  return value;
}
export function importe(value: unknown, signed = false, zero = false): string {
  const text = limpiar(value);
  if (!(signed ? /^-?\d{1,18}(?:\.\d{1,2})?$/ : /^\d{1,18}(?:\.\d{1,2})?$/).test(text)) throw new ClientError("Importe inválido: use hasta dos decimales, sin separadores de miles.", 422);
  const decimal = new Prisma.Decimal(text);
  if (!zero && decimal.isZero()) throw new ClientError("El monto debe ser mayor que cero.", 422);
  return decimal.toFixed(2);
}
export function identidad(cuenta: number, fecha: string, operacion: string, signo: number, monto: string) {
  if (![1, -1].includes(signo)) throw new ClientError("Signo inválido.", 422);
  const datos = JSON.stringify([String(cuenta), fechaCivil(fecha), limpiar(operacion), String(signo), importe(monto)]);
  return { identidad_datos: datos, identidad_sha256: createHash("sha256").update(datos, "utf8").digest("hex"), identidad_version: 1 };
}
export function normalizarOrigen(row: RemoteRow, cuenta: number, moneda: string) {
  const montoFirmado = importe(row.monto, true),
    decimal = new Prisma.Decimal(montoFirmado);
  const signo = decimal.isNegative() ? -1 : 1,
    indicado = limpiar(row.sumaoresta).toLowerCase();
  if (indicado && ![signo === 1 ? "suma" : "resta", signo === 1 ? "+" : "-"].includes(indicado)) throw new ClientError("SIGNO_INCONSISTENTE", 422);
  if (limpiar(row.moneda).toUpperCase() !== moneda.toUpperCase()) throw new ClientError("MONEDA_INCONSISTENTE", 422);
  const numero_operacion = limpiar(row.numerooperacion),
    descripcion = limpiar(row.descripcion),
    fecha = fechaCivil(limpiar(row.fecha));
  if (!numero_operacion || numero_operacion.length > 500 || !descripcion || descripcion.length > 500) throw new ClientError("DATOS_BANCARIOS_INVALIDOS", 422);
  const monto = decimal.abs().toFixed(2);
  return { numero_operacion, descripcion, fecha, signo, monto, ...identidad(cuenta, fecha, numero_operacion, signo, monto) };
}
export function datosComparables(value: ReturnType<typeof normalizarOrigen>) {
  return JSON.stringify([value.fecha, value.numero_operacion, value.descripcion, value.signo, value.monto]);
}
export function legado(row: RemoteRow, signo: number, normalizarFormatos = true) {
  const values: Record<string, string | null> = {};
  const problemas: string[] = [];
  const detalles: { campo: string; motivo: string; accion_sugerida: string }[] = [];
  const problem = (campo: string, motivo: string, accion_sugerida: string) => {
    problemas.push(campo);
    detalles.push({ campo, motivo, accion_sugerida });
  };
  for (const key of referencias) {
    const source = key === "tipo_operacion" ? "tipooperacion" : key;
    const text = limpiar(row[source]),
      limit = key === "referencia_ft_op_factoring" ? 200 : key.startsWith("referencia_") && key !== "referencia_descripcion" ? 50 : 500;
    if (text.length > limit) {
      problem(source, `El texto excede el máximo de ${limit} caracteres.`, `Revise el dato y registre una referencia de hasta ${limit} caracteres. No se recortó automáticamente.`);
      values[key] = null;
    } else values[key] = text || null;
  }
  for (const key of ["origen_comision", "destino_comision", "monto_neto"] as const) {
    try {
      if (row[key] == null || limpiar(row[key]) === "") {
        values[key] = null;
        continue;
      }
      const number = new Prisma.Decimal(importe(row[key], key === "monto_neto" || normalizarFormatos, true));
      if ((key !== "monto_neto" && number.isNegative() && !normalizarFormatos) || (key === "monto_neto" && !number.isZero() && (number.isNegative() ? -1 : 1) !== signo)) throw new ClientError("El signo del monto neto no coincide con la dirección del movimiento bancario.", 422);
      values[key] = number.abs().toFixed(2);
    } catch (error) {
      values[key] = null;
      const negativeCommission = key !== "monto_neto" && /^-\d/.test(limpiar(row[key]));
      problem(key, negativeCommission ? "La comisión recibida es negativa; el modelo local exige una magnitud no negativa." : error instanceof ClientError ? error.message : "El importe recibido no es válido.", key === "monto_neto" ? "Revise el formato y que el signo corresponda al cargo o abono. El dato auxiliar se omitió; puede corregirlo en el movimiento importado." : "Revise la comisión y registre una magnitud no negativa con hasta dos decimales, sin separadores de miles.");
    }
  }
  for (const key of ["detalle_fecha", "detalle_hora"] as const) {
    let text = limpiar(row[key]);
    if (key === "detalle_hora" && normalizarFormatos) {
      const match = text.match(/^(0?[1-9]|1[0-2]):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)$/i);
      if (match) text = `${String((Number(match[1]) % 12) + (match[4].toUpperCase() === "PM" ? 12 : 0)).padStart(2, "0")}:${match[2]}:${match[3] || "00"}`;
    }
    try {
      if (text) {
        if (key === "detalle_fecha") fechaCivil(text);
        else if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(text)) throw new Error();
      }
      values[key] = text || null;
    } catch {
      values[key] = null;
      problem(key, key === "detalle_fecha" ? "La fecha de detalle no es una fecha civil válida en formato AAAA-MM-DD." : "La hora de detalle no tiene un formato válido HH:mm o HH:mm:ss entre 00:00:00 y 23:59:59.", key === "detalle_fecha" ? "Revise la fecha y registre solo año, mes y día, sin componente de hora." : "Revise la hora y use el formato de 24 horas.");
    }
  }
  return { values, problemas, detalles };
}
export function jsonSeguro(row: RemoteRow): string {
  return JSON.stringify(row, (_key, value) => (typeof value === "bigint" ? String(value) : value));
}
