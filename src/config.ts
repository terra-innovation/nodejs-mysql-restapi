// src/env.ts
import { loadEnvironment } from "#src/utils/loadEnvironment.js";
import { z } from "zod";

export const environmentSource = loadEnvironment();

for (const [key, fallback] of Object.entries({ PORT: 3000, WEB_SITE_PORT: 0, DECOLECTA_BASE_URL: "URL predeterminada del proveedor", APISPERU_BASE_URL: "URL predeterminada del proveedor" })) {
  if (process.env[key] === undefined) console.info(`[config] No se encontró ${key}; se usará el valor predeterminado: ${fallback}.`);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  APP_STAGE: z.enum(["development", "production", "test", "qa", "preproduction"]).optional(),
  PORT: z.coerce.number().default(3000),
  WEB_SITE: z.string().url(),
  WEB_SITE_PORT: z.coerce.number().default(0),

  // Tokens
  TOKEN_KEY_JWT: z.string(),
  TOKEN_KEY_OTP: z.string(),

  // SMTP
  MAIL_ENCRYPTION_KEY_COFIG: z.string(),

  // Telegram
  TELEGRAM_ACTIVE: z.enum(["true", "false"]).transform((v) => v === "true"),
  TELEGRAM_IMPORTANT_TOKEN: z.string(),
  TELEGRAM_IMPORTANT_CHATID: z.string(),
  TELEGRAM_IMFORMATION_TOKEN: z.string(),
  TELEGRAM_IMFORMATION_CHATID: z.string(),
  TELEGRAM_WARING_TOKEN: z.string(),
  TELEGRAM_WARRING_CHATID: z.string(),
  TELEGRAM_ERROR_TOKEN: z.string(),
  TELEGRAM_ERROR_CHATID: z.string(),

  // Prisma - Base de datos Factoring
  PRISMA_DATABASE_FACTORING_NICKNAME: z.string(),
  PRISMA_DATABASE_FACTORING_URL: z.string().url(),
  PRISMA_DATABASE_FACTORING_TRANSACTION_TIMEOUT: z.coerce.number(),

  //Prino Logger
  LOG_LEVEL_CONSOLE: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]),
  LOG_LEVEL_FILE: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]),
  PRISMA_DATABASE_FACTORING_LOG_QUERY: z.enum(["true", "false"]).transform((v) => v === "true"),
  PRISMA_DATABASE_FACTORING_LOG_INFO: z.enum(["true", "false"]).transform((v) => v === "true"),
  PRISMA_DATABASE_FACTORING_LOG_WARN: z.enum(["true", "false"]).transform((v) => v === "true"),
  PRISMA_DATABASE_FACTORING_LOG_ERROR: z.enum(["true", "false"]).transform((v) => v === "true"),
  PRISMA_DATABASE_FACTORING_LOG_SLOW_QUERIES: z.enum(["true", "false"]).transform((v) => v === "true"),
  PRISMA_DATABASE_FACTORING_SLOW_QUERY_THRESHOLD: z.coerce.number(),

  // Decolecta - Tipo de Cambio SUNAT / SBS
  DECOLECTA_BASE_URL: z.string().url().default("https://api.decolecta.com/v1"),
  DECOLECTA_API_TOKEN: z.string(),
  APISPERU_BASE_URL: z.string().url().default("https://tipocambio.apisperu.com/api/v1"),
  APISPERU_API_TOKEN: z.string(),
});

export let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    error.issues.forEach((err) => {
      const key = err.path.join(".");
      console.error(`[config] Variable ${key}: ${process.env[key] === undefined ? "ausente" : "inválida"}. Regla: ${err.code}. No se muestra su valor.`);
    });
    throw Object.assign(new Error("La configuración contiene variables ausentes o inválidas."), { code: "CONFIG_INVALID" });
  }
  throw error; // Re-throw if it's not a ZodError
}
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
