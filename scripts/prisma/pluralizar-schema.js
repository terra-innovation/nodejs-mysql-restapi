import fs from "fs";
import path from "path";
import pluralize from "pluralize-esm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const scriptName = path.basename(__filename);
const schemaFilePath = path.resolve("prisma/ft_factoring", "schema.prisma");

const configurarPluralizacionEspanol = (p) => {
  p.addPluralRule(/([aeiouáéíóú])$/, "$1s");
  p.addPluralRule(/([íú])$/, "$1es");
  p.addPluralRule(/([bcdfghjklmnñpqrstvwxyz])$/, "$1es");
  p.addIrregularRule("pais", "paises");
  p.addIrregularRule("mes", "meses");
  p.addIrregularRule("ley", "leyes");
  p.addIrregularRule("vez", "veces");
  p.addIrregularRule("luz", "luces");
  p.addUncountableRule("análisis");
  p.addUncountableRule("crisis");
  p.addUncountableRule("series");
};

const getDateFormatted = () => {
  const d = new Date();
  return `${d.getFullYear()}${`${d.getMonth() + 1}`.padStart(2, "0")}${`${d.getDate()}`.padStart(2, "0")}_${`${d.getHours()}`.padStart(2, "0")}${`${d.getMinutes()}`.padStart(2, "0")}`;
};

const createBackup = (filePath) => {
  const backupDir = path.join(path.dirname(filePath), "backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `schema.${getDateFormatted()}.prisma.bak`);
  fs.copyFileSync(filePath, backupFile);
  console.log(`✅ Copia de seguridad creada: ${backupFile}`);
};

const pluralizeLastPartFromType = (typeName) => {
  const parts = typeName.split("_");
  const last = parts.pop();
  return [...parts, pluralize(last)].join("_");
};

const pluralizeSchema = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let totalMatches = 0;
  let modified = 0;
  let skipped = 0;

  const evaluationLog = [];

  const newLines = lines.map((line, i) => {
    const match = line.match(/^(\s*)(\w+(?:_\w+)*)(\s+)(\w+(?:_\w+)*)\[\]$/);
    if (match) {
      const [_, indent, attrName, spacing, typeName] = match;
      totalMatches++;

      const expectedAttrName = pluralizeLastPartFromType(typeName);

      if (attrName === expectedAttrName) {
        skipped++;
        const logEntry = `/// Línea ${i + 1}: '${attrName}' ya está pluralizado correctamente.`;
        evaluationLog.push(logEntry);
        console.log(logEntry); // 🟢 Mostrar en consola
        return line;
      }

      // Alineación
      const originalLength = indent.length + attrName.length + spacing.length;
      let newSpacing = " ";
      const newAttrLength = indent.length + expectedAttrName.length;
      if (originalLength > newAttrLength) {
        newSpacing = " ".repeat(originalLength - newAttrLength);
      }

      modified++;
      const logEntry = `/// Línea ${i + 1}: '${attrName}' ➜ '${expectedAttrName}'`;
      evaluationLog.push(logEntry);
      console.log(logEntry); // 🟢 Mostrar en consola
      return `${indent}${expectedAttrName}${newSpacing}${typeName}[]`;
    }

    return line;
  });

  fs.writeFileSync(filePath, newLines.join("\n"));
  console.log(`✅ Archivo schema.prisma actualizado: ${filePath}`);

  return { totalMatches, modified, skipped, evaluationLog };
};

const appendExecutionLog = (filePath, summary) => {
  let content = fs.readFileSync(filePath, "utf-8");

  const logStartMarker = "/// --- INICIO LOG SCRIPT: ";
  const logEndMarker = "/// --- FIN LOG SCRIPT";
  const logRegex = new RegExp(`${logStartMarker}.*?${logEndMarker}`, "gs");
  content = content.replace(logRegex, "").trim();

  const log = [
    `\n${logStartMarker}${scriptName} ---`,
    `/// Fecha de ejecución: ${new Date().toLocaleString()}`,
    `/// Total líneas con relaciones tipo '[]': ${summary.totalMatches}`,
    `/// Modificaciones realizadas: ${summary.modified}`,
    `/// Sin modificar (ya pluralizadas): ${summary.skipped}`,
    `/// --- Detalle de líneas evaluadas ---`,
    ...summary.evaluationLog,
    `${logEndMarker}`,
  ].join("\n");

  fs.writeFileSync(filePath, content + "\n" + log + "\n");
  console.log("📝 Log de ejecución actualizado en schema.prisma");
};

const run = (filePath) => {
  console.log(`📁 Ejecutando script: ${scriptName}`);
  console.log(`📂 Procesando archivo: ${filePath}`);

  configurarPluralizacionEspanol(pluralize);
  createBackup(filePath);

  const summary = pluralizeSchema(filePath);
  appendExecutionLog(filePath, summary);

  console.log("📊 Resumen de ejecución:");
  console.log(`🔎 Total líneas con relaciones tipo '[]': ${summary.totalMatches}`);
  console.log(`✅ Modificaciones realizadas: ${summary.modified}`);
  console.log(`⚠️ Sin modificar (ya pluralizadas): ${summary.skipped}`);
};

run(schemaFilePath);
