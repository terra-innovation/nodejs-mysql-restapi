import { createPool } from "mysql2/promise";
import * as config from "#src/config.js";
import logger, { line, log } from "#src/utils/logger.js";

export const poolFactoring = createPool({
  host: config.DB_FACTORING_HOST,
  user: config.DB_FACTORING_USER,
  password: config.DB_FACTORING_PASSWORD,
  port: Number(config.DB_FACTORING_PORT),
  database: config.DB_FACTORING_DATABASE,
});

// Probamos si hay conexión a la base de datos
try {
  const connection = await poolFactoring.getConnection();
  connection.release();
  log.info(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": Successful connection.");
} catch (error) {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };
    if (errorWithCode.code === "ECONNREFUSED") {
      log.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": Connection unavailable.");
    } else {
      log.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": " + (error as Error & { code?: string }).code);
    }
  } else {
    log.error(line(), "[mysql2] Database " + config.DB_FACTORING_DATABASE + ": " + error.code);
  }
}
