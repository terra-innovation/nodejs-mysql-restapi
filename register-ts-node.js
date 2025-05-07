console.log("[register-ts-node] Registering ts-node and paths...");
// register-ts-node-paths.js
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Registrar ts-node/esm
import { register } from "node:module";
register("ts-node/esm", pathToFileURL("./"));

// Registrar los paths (alias)
import "./node_modules/tsconfig-paths/register.js";

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
