import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 5000;

export const WEB_SITE = process.env.WEB_SITE || "http://localhost:3000/";

export const TOKEN_KEY_JWT = process.env.TOKEN_KEY_JWT || "Hebreos13:6";
export const TOKEN_KEY_OTP = process.env.TOKEN_KEY_OTP || "Génesis1:1";

// BD Factoring
export const DB_FACTORING_HOST = process.env.DB_FACTORING_HOST || "localhost";
export const DB_FACTORING_USER = process.env.DB_FACTORING_USER || "root";
export const DB_FACTORING_PASSWORD = process.env.DB_FACTORING_PASSWORD || "";
export const DB_FACTORING_DATABASE = process.env.DB_FACTORING_DATABASE || "ft_factoring_ds01";
export const DB_FACTORING_PORT = process.env.DB_FACTORING_PORT || 3306;

// BD Factoring Big Data
export const DB_BIGDATA_HOST = process.env.DB_BIGDATA_HOST || "localhost";
export const DB_BIGDATA_USER = process.env.DB_BIGDATA_USER || "root";
export const DB_BIGDATA_PASSWORD = process.env.DB_BIGDATA_PASSWORD || "";
export const DB_BIGDATA_DATABASE = process.env.DB_BIGDATA_DATABASE || "ft_factoring_bigdata";
export const DB_BIGDATA_PORT = process.env.DB_BIGDATA_PORT || 3306;
