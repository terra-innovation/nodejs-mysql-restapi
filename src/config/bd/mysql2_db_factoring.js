import { createPool } from "mysql2/promise";
import * as config from "../../config.js";
import logger, { line } from "../../utils/logger.js";

export const poolFactoring = createPool({
  host: config.DB_FACTORING_HOST,
  user: config.DB_FACTORING_USER,
  password: config.DB_FACTORING_PASSWORD,
  port: config.DB_FACTORING_PORT,
  database: config.DB_FACTORING_DATABASE,
});

// Probamos si hay conexión a la base de datos
try {
  const connection = await poolFactoring.getConnection();
  connection.release();
  logger.info(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": Successful connection.");
} catch (error) {
  if (error instanceof Error) {
    if (error.code === "ECONNREFUSED") {
      logger.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": Connection unavailable.");
    } else {
      logger.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": " + error.code);
    }
  } else {
    logger.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": " + error.code);
  }
}
