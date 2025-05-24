import { readdir, stat, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Función para obtener __dirname en módulo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración inicial
const PROJECT_PATH = path.resolve("src/controllers"); // Ajusta esto a tu ruta raíz

// Función recursiva para obtener archivos
async function findControllerFiles(dir) {
  let files = [];
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const subFiles = await findControllerFiles(fullPath);
      files = files.concat(subFiles);
    } else if (item.isFile() && item.name.endsWith("Controller.ts") && !item.name.includes("prisma")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Función para procesar archivos encontrados
async function processFiles(files) {
  let copiedCount = 0;
  let skippedCount = 0;

  for (const originalPath of files) {
    const dir = path.dirname(originalPath);
    const originalName = path.basename(originalPath);
    const newName = originalName.replace("Controller.ts", ".prisma.Controller.ts");
    const newPath = path.join(dir, newName);

    try {
      // Verificar si el archivo ya existe
      await stat(newPath);
      console.log(`❌ Ya existe: ${newPath} — se omite la copia.`);
      skippedCount++;
    } catch (err) {
      if (err.code === "ENOENT") {
        await copyFile(originalPath, newPath);
        console.log(`✅ Copiado: ${originalPath} → ${newPath}`);
        copiedCount++;
      } else {
        throw err;
      }
    }
  }

  return { copiedCount, skippedCount };
}

// Función principal que ejecuta todo
async function run() {
  console.log(`🚀 Iniciando búsqueda en: ${PROJECT_PATH}`);

  try {
    const controllerFiles = await findControllerFiles(PROJECT_PATH);
    console.log(`📦 Archivos encontrados: ${controllerFiles.length}`);

    const { copiedCount, skippedCount } = await processFiles(controllerFiles);

    console.log("\n📊 Resumen del proceso:");
    console.log(`   - Total encontrados: ${controllerFiles.length}`);
    console.log(`   - Copiados: ${copiedCount}`);
    console.log(`   - Omitidos (ya existían): ${skippedCount}`);
  } catch (error) {
    console.error("❌ Error durante la ejecución:", error.message);
  }
}

run();
