import app from "./app.js";
import { PORT } from "./config.js";
import logger, { line } from "./utils/logger.js";

// Method 2
app.listen(PORT);
logger.info(line(), `Server on port http://localhost:${PORT}`);
