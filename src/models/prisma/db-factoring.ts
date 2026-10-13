//import { PrismaClient, Prisma } from "#src/models/prisma/ft_factoring/client.js";
import { Prisma, PrismaClient } from "#root/generated/prisma/ft_factoring/client.js";
import { env, isProduction } from "#src/config.js";
import { getContext } from "#src/utils/context/loggerContext.js";
import { line, log } from "#src/utils/logger.pino.js";
import { createMariaDbAdapter } from "#src/models/prisma/mariadbAdapter.js";
import { startupFailure } from "#src/utils/startupDiagnostics.js";

type InitOptions = {
  retries?: number;
  baseDelayMs?: number;
};

export class PrismaFTManager {
  private static instance: PrismaClient;
  private static connectionValidated = false;
  private static transactionTimeout = env.PRISMA_DATABASE_FACTORING_TRANSACTION_TIMEOUT || 8000;
  private static slowQueryThreshold = env.PRISMA_DATABASE_FACTORING_SLOW_QUERY_THRESHOLD || 200;
  private static logLevels = this.getLogLevels();

  private constructor() {} // Prevent instantiation

  public static get client(): PrismaClient {
    if (!this.instance) {
      this.instance = this.createClient();
      this.setupEventListeners();
    }
    return this.instance;
  }

  private static createClient(): PrismaClient {
    const logDefs = this.logLevels.map((level): Prisma.LogDefinition => ({
      level,
      emit: "event",
    }));

    const createClient = () =>
      new PrismaClient({
        adapter: createMariaDbAdapter(env.PRISMA_DATABASE_FACTORING_URL),
        log: logDefs,
      });
    const client = isProduction ? createClient() : (global.clientFT ?? (global.clientFT = createClient()));

    return client;
  }

  private static getLogLevels(): Prisma.LogLevel[] {
    const levels: Prisma.LogLevel[] = [];
    if (env.PRISMA_DATABASE_FACTORING_LOG_QUERY || env.PRISMA_DATABASE_FACTORING_LOG_SLOW_QUERIES) levels.push("query");
    if (env.PRISMA_DATABASE_FACTORING_LOG_INFO) levels.push("info");
    if (env.PRISMA_DATABASE_FACTORING_LOG_WARN) levels.push("warn");
    if (env.PRISMA_DATABASE_FACTORING_LOG_ERROR) levels.push("error");
    return levels;
  }

  private static setupEventListeners() {
    const client = this.instance;

    if (this.logLevels.includes("query")) {
      client.$on("query" as never, (e: Prisma.QueryEvent) => {
        if (!this.connectionValidated) return;
        const store = getContext();
        const duration = Number(e.duration);
        const isSlow = duration > this.slowQueryThreshold;
        const logLevel = isSlow ? "warn" : "debug";
        const msgQuery = isSlow ? "Slow Query" : "Query";

        const printLogQuery = env.PRISMA_DATABASE_FACTORING_LOG_QUERY ? true : env.PRISMA_DATABASE_FACTORING_LOG_SLOW_QUERIES && isSlow ? true : false;

        if (printLogQuery) {
          log.debug(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] ${msgQuery}`, {
            query: e.query,
            params: e.params,
            duration,
            ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
          });
        }
      });
    }
    if (this.logLevels.includes("warn")) {
      client.$on("warn" as never, (e: Prisma.LogEvent) => log.warn(line(), this.connectionValidated ? `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] ${e.message}` : "[Prisma] Advertencia del motor durante arranque; consulte la etapa y el resultado de conexión."));
    }
    if (this.logLevels.includes("info")) {
      client.$on("info" as never, (e: Prisma.LogEvent) => log.info(line(), this.connectionValidated ? `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] ${e.message}` : "[Prisma] Inicializando el motor de base de datos."));
    }
    if (this.logLevels.includes("error")) {
      client.$on("error" as never, (e: Prisma.LogEvent) => log.error(line(), this.connectionValidated ? `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] ${e.message}` : "[Prisma] Error del motor durante arranque; consulte la etapa y el resultado de conexión."));
    }
  }

  public static async validateConnection({ retries = 5, baseDelayMs = 500 }: InitOptions = {}) {
    PrismaFTManager.connectionValidated = false;
    let attempt = 0;
    while (attempt < retries) {
      try {
        log.info(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] Connecting to the database...`);
        await this.client.$connect();
        // El adaptador puede inicializar el pool sin autenticar una conexión real.
        await this.client.$queryRaw`SELECT 1`;
        PrismaFTManager.connectionValidated = true;
        log.info(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] Database successful connection.`);
        return;
      } catch (error) {
        attempt++;
        log.warn(line(), "[Prisma] Falló la comprobación de conexión de arranque.", { intento: attempt, maximo: retries, ...startupFailure(error) });
        if (attempt >= retries) {
          log.error(line(), "[Prisma] Se agotaron los intentos de conexión de arranque.", startupFailure(error));
          throw error;
        }
        const delay = baseDelayMs * 2 ** (attempt - 1);
        log.info(line(), `[Prisma] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  public static async disconnect() {
    try {
      log.info(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] Disconnecting...`);
      await this.client.$disconnect();
      log.info(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] Disconnected.`);
    } catch (error) {
      log.error(line(), `[Prisma] [${env.PRISMA_DATABASE_FACTORING_NICKNAME}] Error during disconnection:`, error);
    }
  }

  public static get timeout(): number {
    return this.transactionTimeout;
  }
}

// Export para uso externo
export const prismaFT = {
  client: PrismaFTManager.client,
  transactionTimeout: PrismaFTManager.timeout,
  validateDatabaseConnection: PrismaFTManager.validateConnection,
  disconnectDatabase: PrismaFTManager.disconnect,
};
