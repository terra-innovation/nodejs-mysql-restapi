import app from "#src/app.js";
import { PORT } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

try {
  throw new Error("Esto es un error simulado");
} catch (err) {
  log.error(line(), err);
}
try {
  app.listen(PORT);
  log.info(line(), `Server on port http://localhost:${PORT}`);
} catch (err) {
  console.error("🔥 Error de inicio:", err);
  process.exit(1);
}
