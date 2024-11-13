import app from "./app.js";
import { PORT } from "./config.js";
import logger from "./utils/logger.js";

// Method 2
app.listen(PORT);
logger.info(`Server on port http://localhost:${PORT}`);
