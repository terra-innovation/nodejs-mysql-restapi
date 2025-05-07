import fs from "fs";
import path from "path";

// Ruta base a procesar
const targetDir = path.resolve("src/models/ft_factoring");

// Función para obtener todos los archivos .ts de una carpeta recursivamente
function getAllTsFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const files = entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    return entry.isDirectory() ? getAllTsFiles(fullPath) : [fullPath];
  });

  return files.filter((file) => file.endsWith(".ts"));
}

// Contadores
let archivosActualizados = 0;
let archivosSinCambios = 0;

// Función para agregar la extensión .js en los imports
function fixImportsInFile(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");

  const fixedCode = originalCode.replace(/from\s+['"](\.\/[^'"]+?)['"]/g, (match, importPath) => {
    if (!importPath.endsWith(".js")) {
      return `from '${importPath}.js'`;
    }
    return match;
  });

  if (fixedCode !== originalCode) {
    fs.writeFileSync(filePath, fixedCode, "utf-8");
    archivosActualizados++;
    console.log(`✔ Imports actualizados en: ${filePath}`);
  } else {
    archivosSinCambios++;
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

export const run = async () => {
  console.log(`\n🚀 Iniciando corrección de imports en: ${targetDir}\n`);

  const tsFiles = getAllTsFiles(targetDir);
  tsFiles.forEach(fixImportsInFile);

  // Resumen final
  console.log(`\n📊 Resumen del procesamiento:`);
  console.log(`🔹 Archivos totales procesados: ${tsFiles.length}`);
  console.log(`✅ Archivos actualizados:       ${archivosActualizados}`);
  console.log(`ℹ Archivos sin cambios:        ${archivosSinCambios}`);
};

run();
