import app from "#src/app.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

log.debug(line(), `Variables de entorno`, env);

try {
  app.listen(env.PORT);
  log.info(line(), `Server on port http://localhost:${env.PORT}`);
} catch (err) {
  console.error("🔥 Error de inicio:", err);
  process.exit(1);
}
