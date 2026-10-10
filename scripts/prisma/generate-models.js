import { execFile } from "child_process";
import { promisify } from "util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSchemaBackup } from "./schema-backup.js";

const execFileAsync = promisify(execFile);
const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const schemaPath = path.join(rootDir, "prisma/ft_factoring/schema.prisma");
const configPath = path.join(rootDir, "prisma.config.ts");
const prismaCli = path.join(rootDir, "node_modules/prisma/build/index.js");
const prismaOptions = ["--config", configPath, "--schema", schemaPath];

const runCommand = async (args, label) => {
  try {
    console.log(`\n🔧 Ejecutando: ${label}`);
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
      cwd: rootDir,
      env: { ...process.env, NODE_ENV: "development" },
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ Completado: ${label}`);
  } catch (err) {
    console.error(`❌ Error en "${label}":`, err.message || err);
    process.exit(1);
  }
};

const runAll = async () => {
  console.log("📁 Sincronizando exclusivamente el modelo ft_factoring (configuración de desarrollo).");
  createSchemaBackup(schemaPath, "antes-db-pull");
  await runCommand([prismaCli, "db", "pull", ...prismaOptions], "Sincronizar base de datos con Prisma");
  await runCommand([path.join(rootDir, "scripts/prisma/pluralizar-schema.js")], "Pluraliza schema");
  await runCommand([path.join(rootDir, "scripts/prisma/renombrar-atributos-especiales.js")], "Renombra atributos especiales");
  await runCommand([prismaCli, "generate", ...prismaOptions], "Generar modelos con Prisma");
  console.log("\n🚀 Todos los scripts se ejecutaron correctamente.");
};

runAll().catch((err) => {
  console.error("❌ No se pudo preparar la sincronización de Factoring:", err.message);
  process.exitCode = 1;
});
