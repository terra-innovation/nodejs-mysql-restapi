import "#src/utils/globalErrorHandlers.js";
import app from "#src/app.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { shutdownHandler } from "#src/utils/shutdownHandler.js";
import { performance } from "node:perf_hooks";
import "#src/utils/ipAccessControl.js"; // opcional: fuerza preload de listas

const start = performance.now();

async function startServer(): Promise<void> {
  try {
    //log.debug(line(), `Variables de entorno`, env);
    await prismaFT.validateDatabaseConnection({
      retries: 5,
      baseDelayMs: 500,
    });

    app.listen(env.PORT, () => {
      const duration = (performance.now() - start).toFixed(2);
      log.info(line(), `Server running at ${env.WEB_SITE}:${env.PORT}`);
      log.info(line(), `Startup time: ${duration}ms`);
    });

    shutdownHandler.registerShutdownHooks();
  } catch (err) {
    log.error("🔥 Error starting server: ", err);
    process.exit(1);
  }
}
startServer();
