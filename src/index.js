import app from "./app.js";
import { PORT } from "./config.js";

// Method 2
console.log(new Date().toString());
console.log(new Date());

app.listen(PORT);
console.log(`Server on port http://localhost:${PORT}`);
