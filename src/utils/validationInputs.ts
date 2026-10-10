import { z } from "zod";

// Conversiones del transporte: no usar Boolean("false"), Number("") ni String(null).
// Los esquemas Zod conservan el control de obligatoriedad, null y valores predeterminados.
type InputOptions = { trim?: boolean; transforms?: ((value: any) => unknown)[] };

// El objeto ausente se construye antes de validar sus campos, sin omitirlos.
export function objectInput<S extends z.ZodType>(schema: S) {
  return z.preprocess((value) => (value === undefined ? {} : value), schema);
}

function prepare(value: unknown, convert: (value: unknown) => unknown, options: InputOptions = {}) {
  if (value === undefined) return value;
  let result = convert(value);
  if (options.trim && typeof result === "string") result = result.trim();
  for (const transform of options.transforms ?? []) result = transform(result);
  return result;
}

export function stringInput<S extends z.ZodType>(schema: S, options: InputOptions = {}) {
  return z.preprocess(
    (value) =>
      prepare(
        value,
        (input) => {
          if (input == null || Array.isArray(input)) return input;
          const converted = typeof (input as { toString?: unknown }).toString === "function" ? input.toString() : input;
          return converted === "[object Object]" ? input : converted;
        },
        options,
      ),
    schema,
  );
}

export function numberInput<S extends z.ZodType>(schema: S, options: InputOptions = {}) {
  return z.preprocess(
    (value) =>
      prepare(
        value,
        (input) => {
          if (input == null || typeof input === "number") return input;
          if (typeof input === "string") {
            const numeric = input.replace(/\s/g, "");
            return numeric === "" ? NaN : Number(numeric);
          }
          return parseFloat(String(input));
        },
        options,
      ),
    schema,
  );
}

export function booleanInput<S extends z.ZodType>(schema: S) {
  return z.preprocess((value) => {
    if (/^(true|1)$/i.test(String(value))) return true;
    if (/^(false|0)$/i.test(String(value))) return false;
    return value;
  }, schema);
}

// Las fechas ISO sin zona conservan su interpretación local; las que incluyen Z/offset,
// su instante UTC. No convertir null en epoch ni cadenas vacías en fechas válidas.
function dateValue(value: unknown): unknown {
  if (value == null || value instanceof Date) return value;
  const text = String(value);
  const match = /^(\d{4}|[+-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2})(?:[,.](\d+))?)?(?:(Z)|([+-])(\d{2})(?::?(\d{2}))?)?)?$/.exec(text);
  if (!match) return new Date(Date.parse(text));
  const year = Number(match[1]);
  const month = (Number(match[2]) || 1) - 1;
  const day = Number(match[3]) || 1;
  const hour = Number(match[4]) || 0;
  const minute = Number(match[5]) || 0;
  const second = Number(match[6]) || 0;
  const millisecond = Number((match[7] ?? "").substring(0, 3)) || 0;
  if (!match[8] && !match[9]) return new Date(year, month, day, hour, minute, second, millisecond);
  const offset = ((Number(match[10]) || 0) * 60 + (Number(match[11]) || 0)) * (match[9] === "+" ? -1 : 1);
  return new Date(Date.UTC(year, month, day, hour, minute + offset, second, millisecond));
}

export function dateInput<S extends z.ZodType>(schema: S, options: InputOptions = {}) {
  return z.preprocess((value) => prepare(value, dateValue, options), schema);
}

export const inputEmailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const inputUuidPattern = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
