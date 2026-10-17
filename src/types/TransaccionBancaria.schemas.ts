import { z } from "zod";
import { fechaCivil } from "#src/domain/banca/transaccionBancaria.Policy.js";
export const uuidBanco = z.string().uuid();
export const versionBanco = z.number().int().min(1).max(4294967294);
export const fechaBanco = z.string().refine((value) => {
  try {
    fechaCivil(value);
    return true;
  } catch {
    return false;
  }
}, "Fecha inválida.");
export const paginaBanco = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(100).default(""),
    cuenta: uuidBanco.optional(),
    cuentas: z
      .preprocess(
        (value) => (typeof value === "string" ? value.split(",") : value),
        z
          .array(uuidBanco)
          .min(1)
          .max(100)
          .refine((values) => new Set(values).size === values.length),
      )
      .optional(),
    desde: fechaBanco.optional(),
    hasta: fechaBanco.optional(),
    sortBy: z
      .string()
      .regex(/^[a-z_]{1,64}$/)
      .optional(),
    desc: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .strict();
export const consultaOrigenBanco = paginaBanco
  .omit({ cuenta: true, cuentas: true })
  .extend({ conexion: uuidBanco, desde: fechaBanco, hasta: fechaBanco })
  .refine((value) => value.desde <= value.hasta, "Informe ambas fechas en orden.");
export const paginaMovimientosBanco = paginaBanco.refine((value) => !value.desde || !value.hasta || value.desde <= value.hasta, "Informe las fechas en orden.");
const optionalText = (max = 500) => z.string().trim().max(max).nullable().optional();
export const movimientoBanco = z
  .object({
    cuenta: uuidBanco,
    numero_operacion: z.string().trim().min(1).max(500),
    fecha: fechaBanco,
    descripcion: z.string().trim().min(1).max(500),
    signo: z.union([z.literal(1), z.literal(-1)]),
    monto: z.string().regex(/^\d{1,18}(?:\.\d{1,2})?$/),
    tipo_operacion: optionalText(),
    detalle_fecha: fechaBanco.nullable().optional(),
    detalle_hora: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
      .nullable()
      .optional(),
    origen_cuenta: optionalText(),
    origen_nombre: optionalText(),
    destino_cuenta: optionalText(),
    destino_nombre: optionalText(),
    origen_comision: optionalText(21),
    destino_comision: optionalText(21),
    monto_neto: optionalText(21),
    referencia_descripcion: optionalText(),
    referencia_proveedor_ruc: optionalText(50),
    referencia_proveedor_factura: optionalText(50),
    referencia_proveedor_boleta: optionalText(50),
    referencia_ft_factura: optionalText(50),
    referencia_ft_op_factoring: optionalText(200),
  })
  .strict();
export const mapeoBanco = z
  .object({
    conexion: uuidBanco,
    cuenta: uuidBanco,
    cuenta_origen: z.string().trim().min(1).max(500),
    tabla_origen: z
      .string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/)
      .optional(),
  })
  .strict();
export const sincronizacionBanco = z
  .object({
    conexion: uuidBanco,
    cuentas: z
      .array(uuidBanco)
      .min(1)
      .max(100)
      .refine((values) => new Set(values).size === values.length)
      .optional(),
    desde: fechaBanco.nullable().default(null),
    hasta: fechaBanco.nullable().default(null),
    historico: z.boolean().default(false),
  })
  .strict()
  .refine((value) => (!value.desde && !value.hasta) || (value.desde && value.hasta && value.desde <= value.hasta), "Informe ambas fechas en orden o deje ambas vacías.");
export const cambioBanco = z.object({ accion: z.enum(["editar", "anular", "activar"]), version: versionBanco, motivo: z.string().trim().min(1).max(500), movimiento: movimientoBanco.optional() }).strict();
export type MovimientoBancoInput = z.infer<typeof movimientoBanco>;
export type SincronizacionBancoInput = z.infer<typeof sincronizacionBanco>;
