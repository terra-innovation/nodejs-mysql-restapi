import { PrismaClient } from "#src/models/prisma/ft_factoring/client.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

// ✅ Extiende el tipo global para incluir prismaFT en modo desarrollo
declare global {
  var client: PrismaClient | undefined;
}

// ✅ Singleton para evitar múltiples instancias
const client: PrismaClient =
  env.NODE_ENV === "production"
    ? new PrismaClient()
    : global.prismaFT ??
      (global.prismaFT = new PrismaClient({
        //log: ["query", "info", "warn", "error"],
      }));

const transactionTimeout = env.PRISMA_DATABASE_FACTORING_TRANSACTION_TIMEOUT || 8000;

/**
 * Valida la conexión a la base de datos.
 * Lanza si no se puede conectar.
 */
async function validateDatabaseConnection({
  retries = 5,
  baseDelayMs = 500,
}: {
  retries?: number;
  baseDelayMs?: number;
} = {}) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Connecting to the database...`);
      await client.$connect();
      log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Database successful connection.`);
      return;
    } catch (error) {
      attempt++;
      log.warn(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Database connection failure:`, error);
      if (attempt >= retries) {
        log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Error connecting to the database:`, error);
        throw error;
      }
      const delay = baseDelayMs * 2 ** (attempt - 1); // Exponential backoff
      log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Cierra conexión de Prisma
 */
async function disconnectDatabase() {
  try {
    log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Disconnecting from database...`);
    await client.$disconnect();
    log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Database disconnected.`);
  } catch (error) {
    log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Error during disconnection:`);
  }
}

// 👇 Exportamos como objeto "prisma"
export const prismaFT = {
  client,
  transactionTimeout,
  validateDatabaseConnection,
  disconnectDatabase,
};
