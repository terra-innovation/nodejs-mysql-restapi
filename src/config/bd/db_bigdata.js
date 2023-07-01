import { createPool } from "mysql2/promise";
import { DB_BIGDATA_DATABASE, DB_BIGDATA_HOST, DB_BIGDATA_PASSWORD, DB_BIGDATA_PORT, DB_BIGDATA_USER } from "../../config.js";

export const poolBigData = createPool({
  host: DB_BIGDATA_HOST,
  user: DB_BIGDATA_USER,
  password: DB_BIGDATA_PASSWORD,
  port: DB_BIGDATA_PORT,
  database: DB_BIGDATA_DATABASE,
});
