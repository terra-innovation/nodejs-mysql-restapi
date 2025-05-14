import { PrismaClient, Prisma } from "#src/models/prisma/ft_factoring/client.js";
import { env, isProduction } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

// ✅ Configuración de Prisma basado en las variables de entorno
const prismaLogLevels: Prisma.LogLevel[] = [];

if (env.PRISMA_DATABASE_FACTORING_LOG_QUERY) prismaLogLevels.push("query");
if (env.PRISMA_DATABASE_FACTORING_LOG_INFO) prismaLogLevels.push("info");
if (env.PRISMA_DATABASE_FACTORING_LOG_WARN) prismaLogLevels.push("warn");
if (env.PRISMA_DATABASE_FACTORING_LOG_ERROR) prismaLogLevels.push("error");

// ✅ Extiende el tipo global para incluir prismaFT en modo desarrollo
declare global {
  var clientFT: PrismaClient;
}

// ✅ Singleton para evitar múltiples instancias
const clientFT: PrismaClient = isProduction
  ? new PrismaClient({
      log: prismaLogLevels.map((level): Prisma.LogDefinition => ({ level, emit: "event" })),
    })
  : global.clientFT ??
    (global.clientFT = new PrismaClient({
      log: prismaLogLevels.map((level): Prisma.LogDefinition => ({ level, emit: "event" })),
    }));

// ✅ Umbral para las consultas lentas
const SLOW_QUERY_THRESHOLD = env.PRISMA_DATABASE_FACTORING_SLOW_QUERY_THRESHOLD || 200;

const transactionTimeout = env.PRISMA_DATABASE_FACTORING_TRANSACTION_TIMEOUT || 8000;

// ✅ Configurar eventos de Prisma para registrar queries y errores
if (prismaLogLevels.includes("query")) {
  clientFT.$on("query" as never, (e: Prisma.QueryEvent) => {
    const duration = Number(e.duration);
    const logLevel = duration > SLOW_QUERY_THRESHOLD ? "warn" : "debug";
    const msgQuery = duration > SLOW_QUERY_THRESHOLD ? "Slow Query" : "Query";

    log[logLevel](line(), `[Prisma] ${msgQuery}`, {
      query: e.query,
      params: e.params,
      duration,
    });
  });
}

if (prismaLogLevels.includes("warn")) {
  clientFT.$on("warn" as never, (e: Prisma.LogEvent) => log.warn(line(), `[Prisma] ${e.message}`));
}

if (prismaLogLevels.includes("info")) {
  clientFT.$on("info" as never, (e: Prisma.LogEvent) => log.info(line(), `[Prisma] ${e.message}`));
}
if (prismaLogLevels.includes("error")) {
  clientFT.$on("error" as never, (e: Prisma.LogEvent) => log.error(line(), `[Prisma] ${e.message}`));
}

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
      await clientFT.$connect();
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
    await clientFT.$disconnect();
    log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Database disconnected.`);
  } catch (error) {
    log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Error during disconnection:`);
  }
}

// 👇 Exportamos como objeto "prisma"
export const prismaFT = {
  client: clientFT,
  transactionTimeout,
  validateDatabaseConnection,
  disconnectDatabase,
};
