import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Ruta del directorio a procesar
const TARGET_DIR = path.resolve("src/models/ft_factoring");

// Lista de tipos primitivos de TypeScript
const PRIMITIVE_TYPES = new Set(["number", "string", "boolean", "bigint", "symbol", "null", "undefined", "any", "unknown", "never", "object", "void"]);

let archivosProcesados = 0;
let archivosActualizados = 0;
let archivosSinCambios = 0;

// Reemplazo de líneas que inician con _id pero no son de tipo primitivo
const replaceIdLines = (content) => {
  return content
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*)_id([a-zA-Z0-9_]+)!:\s*([^;]+);$/);
      if (!match) return line;

      const [, indent, idPart, type] = match;
      const trimmedType = type.trim();

      if (PRIMITIVE_TYPES.has(trimmedType)) {
        return line; // No reemplazar si es tipo primitivo
      }

      return `${indent}${idPart}!: ${trimmedType};`;
    })
    .join("\n");
};

export const run = async () => {
  console.log(`\n🚀 Iniciando procesamiento en: ${TARGET_DIR}\n`);

  try {
    const files = await readdir(TARGET_DIR);
    const tsFiles = files.filter((file) => file.endsWith(".ts") && file !== "init-models.ts");

    for (const file of tsFiles) {
      const filePath = path.join(TARGET_DIR, file);
      const content = await readFile(filePath, "utf-8");
      const updatedContent = replaceIdLines(content);

      archivosProcesados++;

      if (content !== updatedContent) {
        await writeFile(filePath, updatedContent, "utf-8");
        archivosActualizados++;
        console.log(`✔ Actualizado: ${filePath}`);
      } else {
        archivosSinCambios++;
        console.log(`ℹ Sin cambios: ${filePath}`);
      }
    }

    // Resumen
    console.log(`\n📊 Resumen del procesamiento:`);
    console.log(`🔹 Archivos procesados:   ${archivosProcesados}`);
    console.log(`✅ Archivos actualizados: ${archivosActualizados}`);
    console.log(`ℹ Archivos sin cambios:  ${archivosSinCambios}`);
    console.log(`\n✅ Proceso completado.\n`);
  } catch (err) {
    console.error("❌ Error al procesar archivos:", err);
  }
};

run();
