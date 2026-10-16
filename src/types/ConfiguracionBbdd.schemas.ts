import { z } from "zod";
export const configuracionBbdd = z
  .object({
    motor: z.enum(["MYSQL", "MARIADB"]).default("MYSQL"),
    alias: z.string().trim().min(1).max(200),
    host: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9.-]+$/)
      .max(253),
    puerto: z.number().int().min(1).max(65535),
    base_datos: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .refine((value) => [...value].every((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127), "El nombre contiene caracteres de control."),
    usuario: z.string().trim().min(1).max(128),
    password: z.string().min(1).max(2048).optional(),
    tls_ca_referencia: z.string().trim().max(255).nullable().optional(),
    habilitado: z.boolean(),
    tls_habilitado: z.boolean().default(true),
  })
  .strict();
export const pruebaBbdd = configuracionBbdd.extend({
  base_datos: z
    .string()
    .trim()
    .max(64)
    .refine((value) => [...value].every((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127), "El nombre contiene caracteres de control.")
    .default(""),
  alias: z.string().max(200).default("Prueba"),
  habilitado: z.boolean().default(false),
});
export type ConfiguracionBbddInput = z.infer<typeof configuracionBbdd>;
