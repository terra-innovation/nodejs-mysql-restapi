// src/env.ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";
import { join } from "path";

if (process.env.NODE_ENV !== "production") {
  config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`) });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  WEB_SITE: z.string().url(),

  // Base de datos Factoring
  DB_FACTORING_NICKNAME: z.string(),
  DB_FACTORING_HOST: z.string(),
  DB_FACTORING_USER: z.string(),
  DB_FACTORING_PASSWORD: z.string(),
  DB_FACTORING_DATABASE: z.string(),
  DB_FACTORING_PORT: z.coerce.number(),

  // Base de datos Big Data
  DB_BIGDATA_NICKNAME: z.string(),
  DB_BIGDATA_HOST: z.string(),
  DB_BIGDATA_USER: z.string(),
  DB_BIGDATA_PASSWORD: z.string(),
  DB_BIGDATA_DATABASE: z.string(),
  DB_BIGDATA_PORT: z.coerce.number(),

  // Tokens
  TOKEN_KEY_JWT: z.string(),
  TOKEN_KEY_OTP: z.string(),

  // SMTP
  SMTP_ZOHO_HOST: z.string(),
  SMTP_ZOHO_PORT: z.coerce.number(),
  SMTP_ZOHO_SECURE: z.enum(["true", "false"]).transform((v) => v === "true"),

  // Mails
  MAIL_CONTACTO_FINANZATECH_NAME: z.string(),
  MAIL_CONTACTO_FINANZATECH_USER: z.string().email(),
  MAIL_CONTACTO_FINANZATECH_PASS: z.string(),
  MAIL_BACKUP: z.string().email(),

  // Prisma
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
});

export let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Environment variable validation failed:");
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1); // Exit the process with an error code
  }
  throw error; // Re-throw if it's not a ZodError
}
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
