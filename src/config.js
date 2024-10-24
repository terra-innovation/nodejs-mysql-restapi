import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 7777;

export const WEB_SITE = process.env.WEB_SITE || "";

export const TOKEN_KEY_JWT = process.env.TOKEN_KEY_JWT || "";
export const TOKEN_KEY_OTP = process.env.TOKEN_KEY_OTP || "";

// BD Factoring
export const DB_FACTORING_HOST = process.env.DB_FACTORING_HOST || "";
export const DB_FACTORING_USER = process.env.DB_FACTORING_USER || "";
export const DB_FACTORING_PASSWORD = process.env.DB_FACTORING_PASSWORD || "";
export const DB_FACTORING_DATABASE = process.env.DB_FACTORING_DATABASE || "";
export const DB_FACTORING_PORT = process.env.DB_FACTORING_PORT || 1111;

// BD Factoring Big Data
export const DB_BIGDATA_HOST = process.env.DB_BIGDATA_HOST || "";
export const DB_BIGDATA_USER = process.env.DB_BIGDATA_USER || "";
export const DB_BIGDATA_PASSWORD = process.env.DB_BIGDATA_PASSWORD || "";
export const DB_BIGDATA_DATABASE = process.env.DB_BIGDATA_DATABASE || "";
export const DB_BIGDATA_PORT = process.env.DB_BIGDATA_PORT || 1111;

// SMTP Zoho Mail
export const SMTP_ZOHO_HOST = process.env.SMTP_ZOHO_HOST || "";
export const SMTP_ZOHO_PORT = process.env.SMTP_ZOHO_PORT || 111;
export const SMTP_ZOHO_SECURE = process.env.SMTP_ZOHO_SECURE || true;

// Accounts Mail
export const MAIL_CONTACTO_FINANZATECH_NAME = process.env.MAIL_CONTACTO_FINANZATECH_NAME || "";
export const MAIL_CONTACTO_FINANZATECH_USER = process.env.MAIL_CONTACTO_FINANZATECH_USER || "";
export const MAIL_CONTACTO_FINANZATECH_PASS = process.env.MAIL_CONTACTO_FINANZATECH_PASS || "";
