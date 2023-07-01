import { createPool } from "mysql2/promise";
import { DB_FACTORING_DATABASE, DB_FACTORING_HOST, DB_FACTORING_PASSWORD, DB_FACTORING_PORT, DB_FACTORING_USER } from "../../config.js";

export const poolFactoring = createPool({
  host: DB_FACTORING_HOST,
  user: DB_FACTORING_USER,
  password: DB_FACTORING_PASSWORD,
  port: DB_FACTORING_PORT,
  database: DB_FACTORING_DATABASE,
});
