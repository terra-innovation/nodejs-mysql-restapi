import fs from "fs";
import path from "path";

// Ruta base del directorio a procesar
const BASE_DIR = path.resolve("src/models/ft_factoring");

// Contadores globales
let totalArchivos = 0;
let archivosActualizados = 0;
let archivosSinCambios = 0;

function processFile(filePath) {
  totalArchivos++;

  const content = fs.readFileSync(filePath, "utf8");

  const updatedContent = content.replace(/^(\s*\w+\??:\s*)Date(\s*;)/gm, "$1Date | Sequelize.Utils.Fn$2");

  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    archivosActualizados++;
    console.log(`✔ Actualizado: ${filePath}`);
  } else {
    archivosSinCambios++;
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith(".ts")) {
      processFile(fullPath);
    }
  });
}

export const run = async () => {
  console.log(`🚀 Iniciando actualización de campos Date en: ${BASE_DIR}\n`);
  walkDir(BASE_DIR);

  console.log(`\n📊 Resumen del procesamiento:`);
  console.log(`🔹 Archivos totales procesados: ${totalArchivos}`);
  console.log(`✅ Archivos actualizados:       ${archivosActualizados}`);
  console.log(`ℹ Archivos sin cambios:        ${archivosSinCambios}`);
};

run();
