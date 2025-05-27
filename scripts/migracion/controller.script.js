import fs from "fs";
import path from "path";

// Ruta base a procesar
const targetDir = path.resolve("src/controllers");

function getAllControllerPrismaTsFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const files = entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    return entry.isDirectory() ? getAllControllerPrismaTsFiles(fullPath) : [fullPath];
  });

  // Filtrar solo archivos que terminan en ".prisma.Dao.ts"
  return files.filter((file) => file.endsWith(".prisma.Controller.ts"));
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

function addImportIfNotExist(filePath, importLine) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  // Verificar si la línea de importación ya existe
  const hasImportLine = lines.some((line) => line.trim() === importLine);

  // Insertar la línea si no existe
  let updatedCode = originalCode;
  if (!hasImportLine) {
    updatedCode = importLine + "\n" + originalCode;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    archivosActualizados++;
    console.log(`✔ Archivo modificado: ${filePath}`);
  } else {
    archivosSinCambios++;
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function adjustNextCharCase(filePath, matchText) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  // Modificar líneas que contienen el texto buscado
  const modifiedLines = lines.map((line) => {
    const index = line.indexOf(matchText);
    if (index !== -1) {
      const charIndex = index + matchText.length;
      const charToReplace = line.charAt(charIndex);
      const lowerChar = charToReplace.toLowerCase();
      const newLine = line.slice(0, charIndex) + lowerChar + line.slice(charIndex + 1);

      if (newLine !== line) {
        updated = true;
        return newLine;
      }
    }
    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    archivosActualizados++;
    console.log(`✔ Archivo modificado: ${filePath}`);
  } else {
    archivosSinCambios++;
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function modifyNameOfTables(filePath, matchText) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    const index = line.indexOf(matchText);
    if (index !== -1) {
      const startIndex = index + matchText.length;
      const afterMatch = line.slice(startIndex);
      const endIndex = afterMatch.indexOf(".");

      if (endIndex !== -1) {
        const textevaluate = afterMatch.slice(0, endIndex);

        // Convertir textevaluate a snake_case
        const snakeCase = textevaluate.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

        // Construir el texto completo que se reemplazará
        const originalText = matchText + textevaluate;
        const transformedText = matchText + snakeCase;

        // Reemplazar en la línea
        const newLine = line.replace(originalText, transformedText);
        if (newLine !== line) {
          updated = true;
          return newLine;
        }
      }
    }
    return line;
  });

  // Si hubo alguna modificación, escribir el archivo actualizado
  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Archivo modificado: ${filePath}`);
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function replaceFindByPk(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Expresión regular para encontrar .findByPk(algo)
    const regex = /\.findByPk\(([^)]+)\);?/g;
    let match;
    let modifiedLine = line;

    while ((match = regex.exec(line)) !== null) {
      const param = match[1].trim(); // e.g., "idarchivo"
      const replacement = `.findUnique({ where: { ${param}: ${param}, }, })`;

      modifiedLine = modifiedLine.replace(match[0], replacement);
      updated = true;
    }

    return modifiedLine;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Reemplazos realizados en: ${filePath}`);
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function replaceAttributesWithSelect(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Regex que encuentra: attributes: ["_algo"],
    const regex = /attributes:\s*\[\s*"_([a-zA-Z0-9_]+)"\s*\],?/;
    const match = line.match(regex);

    if (match) {
      const fieldName = match[1]; // "idarchivo", "iddepartamento", etc.
      const newLine = `select: { ${fieldName}: true },`;
      updated = true;
      return line.replace(regex, newLine);
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Archivo modificado: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
    archivosSinCambios++;
  }
}

function replaceUpdateCall(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Regex para .update(nombre, {
    const regex = /\.update\(\s*([a-zA-Z0-9_]+)\s*,\s*\{/;
    const match = line.match(regex);

    if (match) {
      const variable = match[1]; // Ej: archivo, banco, etc.
      const newLine = line.replace(regex, `.update({ data: ${variable},`);
      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Archivo modificado: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
    archivosSinCambios++;
  }
}

function addNumberTypeToIdParams(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Regex para capturar funciones exportadas con id param sin tipo
    const regex = /export const (\w+) = async\s*\(tx: TxClient,\s*(id\w+)\s*\)\s*=>\s*{/;
    const match = line.match(regex);

    if (match) {
      const functionName = match[1]; // getArchivoByIdarchivo
      const paramName = match[2]; // idarchivo

      const newLine = line.replace(`${paramName}) => {`, `${paramName}: number) => {`);

      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Parámetros actualizados en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
    archivosSinCambios++;
  }
}

function addModelToPrismaImport(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;
  const modelSet = new Set();

  // Paso 1: Buscar modelos usados en tx.<modelo>.findMany({
  lines.forEach((line) => {
    const match = line.match(/tx\.(\w+)\.findMany\s*\(\s*\{/);
    if (match) {
      modelSet.add(match[1]);
    }
  });

  // Si no hay modelos usados, no hacemos nada
  if (modelSet.size === 0) {
    console.log("ℹ No se encontraron llamadas tx.<modelo>.findMany({...");
    return;
  }

  // Paso 2: Reemplazar la línea de importación
  const modifiedLines = lines.map((line) => {
    const importRegex = /import type { Prisma } from "#src\/models\/prisma\/ft_factoring\/client";/;

    if (importRegex.test(line)) {
      const modelList = Array.from(modelSet).join(", ");
      const newImportLine = `import type { Prisma, ${modelList} } from "#src/models/prisma/ft_factoring/client";`;
      updated = true;
      return newImportLine;
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Importación actualizada en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log("ℹ No se encontró la línea de importación esperada. Sin cambios.");
    archivosSinCambios++;
  }
}

function simplifyCreateStatements(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Buscar patrones como: const archivo_nuevo = await tx.archivo.create(archivo);
    const regex = /const\s+\w+_nuevo\s+=\s+await\s+tx\.(\w+)\.create\((\w+)\);/;
    const match = line.match(regex);

    if (match) {
      const modelo = match[1]; // Ej: archivo, banco
      const variable = match[2]; // Ej: archivo, banco
      const newLine = `const nuevo = await tx.${modelo}.create({ data: ${variable} });`;
      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Sentencias .create() simplificadas en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log("ℹ No se encontraron coincidencias. Sin cambios.");
    archivosSinCambios++;
  }
}

function replaceReturnNuevo(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Buscar líneas que terminen con "return <cualquier_nombre>_nuevo;"
    const regex = /return\s+[a-zA-Z0-9_]+_nuevo\s*;/;
    if (regex.test(line)) {
      updated = true;
      return line.replace(regex, "return nuevo;");
    }
    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Líneas 'return *_nuevo;' reemplazadas en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log("ℹ No se encontraron coincidencias. Sin cambios.");
    archivosSinCambios++;
  }
}

function fixFunctionSignaturesByModel(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  // Paso 1: encontrar modelo en línea de importación
  let modelName = null;
  for (const line of lines) {
    const importMatch = line.match(/import type { Prisma, (\w+) } from "#src\/models\/prisma\/ft_factoring\/client";/);
    if (importMatch) {
      modelName = importMatch[1]; // ejemplo: archivo, banco, zlaboratorio_usuario
      break;
    }
  }

  if (!modelName) {
    console.log("ℹ No se encontró modelo en importación Prisma. No se realizan cambios.");
    return;
  }

  // Paso 2: generar nombre de funciones con mayúsculas
  /*const capitalizedModel = modelName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
*/
  const capitalizedModel = modelName
    .split("_")
    .map((part, index) => (index == 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");

  const modelParamVar = modelName.replace(/_/g, "").toLowerCase();

  const modifiedLines = lines.map((line) => {
    if (line.match(new RegExp(`\\s*export const (activate|insert|update|delete)${capitalizedModel}\\s*=\\s*async\\s*\\(tx: TxClient,\\s*(\\w+)\\) => {\\s*`))) {
      let a = 1;
    }
    const regx = new RegExp(`\\s*export const (activate|insert|update|delete)${capitalizedModel}\\s*=\\s*async\\s*\\(tx: TxClient,\\s*(\\w+)\\) => {\\s*`);
    const functionMatch = line.match(regx);

    if (functionMatch) {
      const action = functionMatch[1]; // activate, insert, etc.
      const param = functionMatch[2]; // ej: archivo, banco, etc.

      let paramType = `${modelName}`;
      if (action === "insert") {
        paramType = `Prisma.${modelName}CreateInput`;
      }

      const newLine = `export const ${action}${capitalizedModel} = async (tx: TxClient, ${param}: ${paramType}): Promise<${modelName}> => {`;
      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    fs.writeFileSync(filePath, modifiedLines.join("\n"), "utf-8");
    console.log(`✔ Funciones corregidas en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ No se encontraron funciones para modificar en:  ${filePath}`);
    archivosSinCambios++;
  }
}

function fixFunctionSignaturesGetAll(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  // Paso 1: encontrar modelo en línea de importación
  let modelName = null;
  for (const line of lines) {
    const importMatch = line.match(/import type { Prisma, (\w+) } from "#src\/models\/prisma\/ft_factoring\/client";/);
    if (importMatch) {
      modelName = importMatch[1]; // ejemplo: archivo, banco, zlaboratorio_usuario
      break;
    }
  }

  if (!modelName) {
    console.log("ℹ No se encontró modelo en importación Prisma. No se realizan cambios.");
    return;
  }

  // Paso 2: generar nombre de funciones con mayúsculas
  /*const capitalizedModel = modelName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
*/
  const capitalizedModel = modelName
    .split("_")
    .map((part, index) => (index == 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");

  const modelParamVar = modelName.replace(/_/g, "").toLowerCase();

  const modifiedLines = lines.map((line) => {
    const reg = `\\s*export const get(\\w+)\\s* = async \\(tx: TxClient, estados: number\\[\\]\\) => {\\s*`;
    if (line.match(new RegExp(reg))) {
      let a = 1;
    }
    const regx = new RegExp(reg);
    const functionMatch = line.match(regx);

    if (functionMatch) {
      const action = functionMatch[1];

      let paramType = `${modelName}`;
      if (action === "insert") {
        paramType = `Prisma.${modelName}CreateInput`;
      }

      //const newLine = `export const ${action}${capitalizedModel} = async (tx: TxClient, ${param}: ${paramType}): Promise<${modelName}> => {`;
      const newLine = `export const get${action} = async (tx: TxClient, estados: number[]): Promise<Prisma.${modelName}WhereInput[]> => {`;

      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    fs.writeFileSync(filePath, modifiedLines.join("\n"), "utf-8");
    console.log(`✔ Funciones corregidas en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ No se encontraron funciones para modificar en:  ${filePath}`);
    archivosSinCambios++;
  }
}

function fixFunctionByModel(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  // Paso 1: encontrar modelo en línea de importación
  let modelName = null;
  for (const line of lines) {
    const importMatch = line.match(/import type { Prisma, (\w+) } from "#src\/models\/prisma\/ft_factoring\/client";/);
    if (importMatch) {
      modelName = importMatch[1]; // ejemplo: archivo, banco, zlaboratorio_usuario
      break;
    }
  }

  if (!modelName) {
    console.log("ℹ No se encontró modelo en importación Prisma. No se realizan cambios.");
    return;
  }

  // Paso 2: generar nombre de funciones con mayúsculas
  /*const capitalizedModel = modelName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
*/
  const capitalizedModel = modelName
    .split("_")
    .map((part, index) => (index == 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");

  const modelParamVar = modelName.replace(/_/g, "").toLowerCase();

  const modifiedLines = lines.map((line) => {
    const reg = `\\s*export const get(\\w+) = async \\(tx: TxClient, id${modelParamVar}: (\\w+)\\) => {\\s*`;
    if (line.match(new RegExp(reg))) {
      let a = 1;
    }
    const regx = new RegExp(reg);
    const functionMatch = line.match(regx);

    if (functionMatch) {
      const action = functionMatch[1];
      const tipodato = functionMatch[2];

      let paramType = `${modelName}`;
      if (action === "insert") {
        paramType = `Prisma.${modelName}CreateInput`;
      }

      //const newLine = `export const ${action}${capitalizedModel} = async (tx: TxClient, ${param}: ${paramType}): Promise<${modelName}> => {`;
      //const newLine = `export const get${action} = async (tx: TxClient, estados: number[]): Promise<Prisma.${modelName}WhereInput[]> => {`;
      const newLine = `export const get${action} = async (tx: TxClient, id${modelParamVar}: ${tipodato}): Promise<${modelName}> => {`;

      updated = true;
      return newLine;
    }

    return line;
  });

  if (updated) {
    fs.writeFileSync(filePath, modifiedLines.join("\n"), "utf-8");
    console.log(`✔ Funciones corregidas en: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ No se encontraron funciones para modificar en:  ${filePath}`);
    archivosSinCambios++;
  }
}

function pascalCase(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function migrarAttributes(filePath, schemaPath = "./prisma/ft_factoring/schema.prisma") {
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ No se encontró el archivo schema.prisma en: ${schemaPath}`);
    return;
  }

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // 1. Extraer modelos
  const modelRegex = /^model\s+(\w+)\s+{/gm;
  let match;
  const modelNames = [];

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    modelNames.push(match[1]);
  }

  if (modelNames.length === 0) {
    console.warn(`⚠ No se encontraron modelos en el schema`);
    return;
  }

  // 2. Crear diccionario PascalCase -> snake_case
  const modelMap = {};
  modelNames.forEach((model) => {
    const snake = pascalCase(model.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase());
    modelMap[snake] = model;
  });

  // 3. Procesar archivo

  const originalCode = fs.readFileSync(filePath, "utf-8");
  let modifiedCode = originalCode;

  Object.entries(modelMap).forEach(([pascal, snake]) => {
    const regex = new RegExp(`\\b${pascal}Attributes\\b`, "g");
    modifiedCode = modifiedCode.replace(regex, snake);
  });

  if (modifiedCode !== originalCode) {
    fs.writeFileSync(filePath, modifiedCode, "utf-8");
    archivosActualizados++;
    console.log(`✔ Reemplazos realizados en: ${filePath}`);
  } else {
    archivosSinCambios++;
    console.log(`ℹ Sin cambios: ${filePath}`);
  }
}

function ajustarTypesDePrisma(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const lines = originalCode.split("\n");

  let updated = false;

  const modifiedLines = lines.map((line) => {
    // Regex que encuentra: attributes: ["_algo"],
    const debeterminar = '"#src/models/prisma/ft_factoring/client";';
    const match = line.trim().endsWith(debeterminar);

    if (match) {
      const start = line.startsWith("import type {");

      if (!start) {
        updated = true;
        const newLine = line.replace("import {", "import type {");
        return newLine;
      }
    }

    return line;
  });

  if (updated) {
    const updatedCode = modifiedLines.join("\n");
    fs.writeFileSync(filePath, updatedCode, "utf-8");
    console.log(`✔ Archivo modificado: ${filePath}`);
    archivosActualizados++;
  } else {
    console.log(`ℹ Sin cambios: ${filePath}`);
    archivosSinCambios++;
  }
}

export const run = async () => {
  console.log(`\n🚀 Iniciando Migración a PRISMA en: ${targetDir}\n`);

  const tsFiles = getAllControllerPrismaTsFiles(targetDir);

  tsFiles.forEach((filePath) => {
    //addImportIfNotExist(filePath, 'import type { Prisma } from "#src/models/prisma/ft_factoring/client";');
    //addImportIfNotExist(filePath, 'import { TxClient } from "#src/types/Prisma.types.js";');
    //adjustNextCharCase(filePath, " = await tx.");
    //modifyNameOfTables(filePath, " = await tx.");
    //replaceFindByPk(filePath);
    //replaceAttributesWithSelect(filePath);
    //replaceUpdateCall(filePath);
    //addNumberTypeToIdParams(filePath);
    //addModelToPrismaImport(filePath);
    //simplifyCreateStatements(filePath);
    //replaceReturnNuevo(filePath);
    //fixFunctionSignaturesByModel(filePath);
    //fixFunctionSignaturesGetAll(filePath);
    //fixFunctionByModel(filePath);
    //migrarAttributes(filePath);
    //ajustarTypesDePrisma(filePath);
  });

  // Resumen final
  console.log(`\n📊 Resumen del procesamiento:`);
  console.log(`🔹 Archivos totales procesados: ${tsFiles.length}`);
  console.log(`✅ Archivos actualizados:       ${archivosActualizados}`);
  console.log(`ℹ Archivos sin cambios:        ${archivosSinCambios}`);
};

run();
