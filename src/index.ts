import "#src/utils/globalErrorHandlers.js";
import app from "#src/app.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";
import { validateDatabaseConnection } from "#src/models/prisma/db-factoring.js";

async function startServer(): Promise<void> {
  try {
    //log.debug(line(), `Variables de entorno`, env);
    await validateDatabaseConnection();
    app.listen(env.PORT);
    log.info(line(), `Server running at ${env.WEB_SITE}:${env.PORT}`);
  } catch (err) {
    log.error("🔥 Error starting server: ", err);
    process.exit(1);
  }
}
startServer();
