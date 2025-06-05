// src/utils/shutdownHandler.ts
import { log, line } from "#src/utils/logger.pino.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";

async function gracefulShutdown(signal: string) {
  try {
    log.info(line(), `Shutdown initiated by signal: ${signal}`);

    // Prisma
    await prismaFT.disconnectDatabase();

    // Aquí puedes cerrar otros recursos (Redis, MQ, etc.)
    // await redis.quit();

    log.info(line(), "Graceful shutdown complete.");
    process.exit(0);
  } catch (err) {
    log.error(line(), "Error during shutdown:", err);
    process.exit(1);
  }
}

/**
 * Registra los listeners de señales del sistema y errores globales
 */
function registerShutdownHooks() {
  ["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
  });
}

// 👇 Exportamos como objeto "prisma"
export const shutdownHandler = {
  gracefulShutdown,
  registerShutdownHooks,
};
