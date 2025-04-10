import app from "#src/app.js";
import { PORT } from "#src/config.js";
import logger, { line } from "#src/utils/logger.js";

app.listen(PORT);
logger.info(line(), `Server on port http://localhost:${PORT}`);
