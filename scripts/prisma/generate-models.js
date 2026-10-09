import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const runCommand = async (cmd, label) => {
  try {
    console.log(`\n🔧 Ejecutando: ${label}`);
    const { stdout, stderr } = await execAsync(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ Completado: ${label}`);
  } catch (err) {
    console.error(`❌ Error en "${label}":`, err.message || err);
    process.exit(1);
  }
};

const runAll = async () => {
  await runCommand("npx dotenv-cli -e .env.development -- npx prisma db pull --schema=prisma/ft_factoring/schema.prisma", "Sicronizar Base de Datos con PRISMA");
  await runCommand("node scripts/prisma/pluralizar-schema.js", "Pluraliza schema");
  await runCommand("node scripts/prisma/renombrar-atributos-especiales.js", "Renombra atributos especiales");
  await runCommand("npx prisma generate --schema=prisma/ft_factoring/schema.prisma", "Generar modelos con Prisma");
  console.log("\n🚀 Todos los scripts se ejecutaron correctamente.");
};

runAll();
