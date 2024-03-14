import { createPool } from "mysql2/promise";
import * as config from "../../config.js";

export const poolBigData = createPool({
  host: config.DB_BIGDATA_HOST,
  user: config.DB_BIGDATA_USER,
  password: config.DB_BIGDATA_PASSWORD,
  port: config.DB_BIGDATA_PORT,
  database: config.DB_BIGDATA_DATABASE,
});
