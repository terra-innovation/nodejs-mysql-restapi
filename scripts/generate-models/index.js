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
  await runCommand("npx sequelize-auto -c ./sequelize-auto.config.json", "Generar modelos con Sequelize");
  await runCommand("node scripts/generate-models/fix-imports.js", "Arreglar imports");
  await runCommand("node scripts/generate-models/fix-aliases.js", "Arreglar aliases");
  await runCommand("node scripts/generate-models/fix-ids.js", "Arreglar IDs personalizados");
  await runCommand("node scripts/generate-models/add-fn-to-date.js", "Agregar funciones a campos tipo Date");
  console.log("\n🚀 Todos los scripts se ejecutaron correctamente.");
};

runAll();
