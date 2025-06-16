//import { PrismaClient, Prisma } from "#src/models/prisma/ft_factoring/client.js";
import { PrismaClient, Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { env, isProduction } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";
import { getContext } from "#src/utils/context/loggerContext.js";

type InitOptions = {
  retries?: number;
  baseDelayMs?: number;
};

export class PrismaFTManager {
  private static instance: PrismaClient;
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
    const logDefs = this.logLevels.map(
      (level): Prisma.LogDefinition => ({
        level,
        emit: "event",
      })
    );

    const client = isProduction ? new PrismaClient({ log: logDefs }) : global.clientFT ?? (global.clientFT = new PrismaClient({ log: logDefs }));

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
        const store = getContext();
        const duration = Number(e.duration);
        const isSlow = duration > this.slowQueryThreshold;
        const logLevel = isSlow ? "warn" : "debug";
        const msgQuery = isSlow ? "Slow Query" : "Query";

        const printLogQuery = env.PRISMA_DATABASE_FACTORING_LOG_QUERY ? true : env.PRISMA_DATABASE_FACTORING_LOG_SLOW_QUERIES && isSlow ? true : false;

        if (printLogQuery) {
          log.debug(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] ${msgQuery}`, {
            query: e.query,
            params: e.params,
            duration,
            ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
          });
        }
      });
    }
    if (this.logLevels.includes("warn")) {
      client.$on("warn" as never, (e: Prisma.LogEvent) => log.warn(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] ${e.message}`));
    }
    if (this.logLevels.includes("info")) {
      client.$on("info" as never, (e: Prisma.LogEvent) => log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] ${e.message}`));
    }
    if (this.logLevels.includes("error")) {
      client.$on("error" as never, (e: Prisma.LogEvent) => log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] ${e.message}`));
    }
  }

  public static async validateConnection({ retries = 5, baseDelayMs = 500 }: InitOptions = {}) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Connecting to the database...`);
        await this.client.$connect();
        log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Database successful connection.`);
        return;
      } catch (error) {
        attempt++;
        log.warn(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Connection failed:`, error);
        if (attempt >= retries) {
          log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Max retries reached.`, error);
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
      log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Disconnecting...`);
      await this.client.$disconnect();
      log.info(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Disconnected.`);
    } catch (error) {
      log.error(line(), `[Prisma] [${env.DB_FACTORING_NICKNAME}] Error during disconnection:`, error);
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
