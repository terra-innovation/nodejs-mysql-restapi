import { PrismaClient } from "#src/models/prisma/ft_factoring/client.js";
import { env } from "#src/config.js";

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

export { prismaFT as default, transactionTimeout };
