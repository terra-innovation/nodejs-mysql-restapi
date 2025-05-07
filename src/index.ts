import app from "#src/app.js";
import { PORT } from "#src/config.js";
import logger, { line, log } from "#src/utils/logger.js";

try {
  app.listen(PORT);
  log.info(line(), `Server on port http://localhost:${PORT}`);
} catch (err) {
  console.error("🔥 Error de inicio:", err);
  process.exit(1);
}
