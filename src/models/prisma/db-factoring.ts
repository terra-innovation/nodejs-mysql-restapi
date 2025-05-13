import { PrismaClient } from "#src/models/prisma/ft_factoring/client.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

// ✅ Extiende el tipo global para incluir prismaFT en modo desarrollo
declare global {
  var prismaFT: PrismaClient | undefined;
}

// ✅ Singleton para evitar múltiples instancias
const prismaFT: PrismaClient =
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
export async function validateDatabaseConnection() {
  try {
    log.info(line(), `[Prisma] Connecting to the database ${env.DB_FACTORING_NICKNAME}...`);
    await prismaFT.$connect();
    log.info(line(), `[Prisma] Database ${env.DB_FACTORING_NICKNAME}: Successful connection.`);
  } catch (error) {
    log.error(line(), `[Prisma] Error connecting to the database ${env.DB_FACTORING_NICKNAME}:`, error);
    throw error;
  }
}

export { prismaFT as default, transactionTimeout };
