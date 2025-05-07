import fs from "fs";
import path from "path";

const filePath = path.resolve("src/models/ft_factoring/init-models.ts");

// Expresión regular: busca `as: "_id..."`
const aliasRegex = /as:\s*['"]_id([^'"]+)['"]/g;

export const run = async () => {
  console.log(`\n🔍 Procesando archivo: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  let matchCount = 0;
  const updated = content.replace(aliasRegex, (_, alias) => {
    matchCount++;
    return `as: "${alias}"`;
  });

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`✅ Aliases actualizados: ${matchCount} reemplazo(s) realizado(s).`);
  } else {
    console.log(`ℹ️ No se encontraron aliases para actualizar.`);
  }

  console.log(`📁 Procesamiento finalizado para: ${filePath}\n`);
};

run();
