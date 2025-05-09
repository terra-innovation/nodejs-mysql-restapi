import { createPool } from "mysql2/promise";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

export const poolFactoring = createPool({
  host: env.DB_FACTORING_HOST,
  user: env.DB_FACTORING_USER,
  password: env.DB_FACTORING_PASSWORD,
  port: Number(env.DB_FACTORING_PORT),
  database: env.DB_FACTORING_DATABASE,
});

// Probamos si hay conexión a la base de datos
try {
  const connection = await poolFactoring.getConnection();
  connection.release();
  log.info(line(), "[mysql2] Database " + env.DB_FACTORING_DATABASE + ": Successful connection.");
} catch (error) {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };
    if (errorWithCode.code === "ECONNREFUSED") {
      log.error(line(), "[mysql2] Database " + env.DB_FACTORING_DATABASE + ": Connection unavailable.");
    } else {
      log.error(line(), "[mysql2] Database " + env.DB_FACTORING_DATABASE + ": " + (error as Error & { code?: string }).code);
    }
  } else {
    log.error(line(), "[mysql2] Database " + env.DB_FACTORING_DATABASE + ": " + error.code);
  }
}
