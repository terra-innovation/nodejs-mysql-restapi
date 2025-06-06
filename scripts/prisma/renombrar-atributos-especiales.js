import fs from "fs";
import path from "path";
import pluralize from "pluralize-esm";
import { fileURLToPath } from "url";

// Obtener el nombre del script actual dinámicamente
const __filename = fileURLToPath(import.meta.url);
const scriptName = path.basename(__filename);

const schemaFilePath = path.resolve("prisma/ft_factoring", "schema.prisma");

const excepcionesRelacion = [
  {
    atributo_original: "colaborador", // atributo_A
    campo: "contactocedente", // atributo_B
    atributo_final: "contacto_cedente", // nuevo nombre deseado
  },
  {
    atributo_original: "zlaboratorio_usuario", // atributo_A
    campo: "usuario", // atributo_B
    atributo_final: "usuario", // nuevo nombre deseado
  },
];

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
  const backupFile = path.join(path.dirname(filePath), `schema.${getDateFormatted()}.prisma`);
  fs.copyFileSync(filePath, backupFile);
  console.log(`✅ Copia de seguridad creada: ${backupFile}`);
};

const pluralizeLastPart = (name) => {
  const parts = name.split("_");
  const last = parts.pop();
  return [...parts, pluralize(last)].join("_");
};

const generarNuevoNombreRelacion = (tipoDato, campoExtraido) => {
  const tipoParts = tipoDato.split("_").map((p) => p.toLowerCase());
  const campo = campoExtraido.toLowerCase();
  let restoCampo = campo;

  tipoParts.forEach((word) => {
    restoCampo = restoCampo.replace(new RegExp(word, "gi"), "");
  });

  restoCampo = restoCampo.replace(/^id/, "");

  if (restoCampo.length === 0) return tipoDato;
  return `${tipoDato}_${restoCampo}`;
};

const eliminarLogAnterior = (lines, scriptName) => {
  const startMarker = `/// --- INICIO LOG DE SCRIPT: ${scriptName} ---`;
  const endMarker = `/// --- FIN LOG DE SCRIPT ---`;

  const startIndex = lines.findIndex((line) => line.trim() === startMarker);
  const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.trim() === endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex + 1);
  }

  return lines;
};

const renombrarAtributosEspeciales = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  let lines = content.split("\n");

  // Eliminar log anterior del mismo script
  lines = eliminarLogAnterior(lines, scriptName);

  let totalMatches = 0;
  let modificados = 0;
  let logDetalles = [];

  const updatedLines = lines.map((line, i) => {
    const originalLine = line;

    //if (!line.includes('@relation("')) return line;

    // --- Caso 1: Relaciones con array ([]), aplicar pluralización ---
    const matchMuchos = line.match(/^(\s*)(\w+)(\s+)(\w+(?:_\w+)*)\[\](.*@relation\("([^"]+)"[^)]*\))/);
    if (matchMuchos) {
      totalMatches++;
      const [_, indent, attr, spacing, tipoDato, rest, relName] = matchMuchos;
      const campoExtraido = relName.match(/_id([a-zA-Z0-9]+)To/);
      if (campoExtraido) {
        const nombreConcatenado = `${tipoDato}_${campoExtraido[1].toLowerCase()}`;
        const nuevoNombre = pluralizeLastPart(nombreConcatenado);
        if (attr !== nuevoNombre) {
          modificados++;
          const nombreConEspacios = `${nuevoNombre}${" ".repeat(Math.max(0, (attr + spacing).length - nuevoNombre.length))}`;
          const nuevaLinea = `${indent}${nombreConEspacios}${tipoDato}[]${rest}`;
          const log = `🛠️ Línea ${i + 1}: (plural) ${attr} ➜ ${nuevoNombre} | Relación: '${relName}' | Original: '${originalLine.trim()}'`;
          console.log(log);
          logDetalles.push(log);
          return nuevaLinea;
        } else {
          const log = `✔️ Línea ${i + 1}: (plural) ${attr} ya está correcto | Relación: '${relName}'`;
          console.log(log);
          logDetalles.push(log);
        }
      }

      return line;
    }

    // --- Caso 2: Relaciones singulares ---
    const matchUno = line.match(/^(\s*)(\w+)(\s+)(\w+(?:_\w+)*)(\??)(.*@relation\("([^"]+)"[^)]*\))/);
    if (matchUno) {
      totalMatches++;
      const [_, indent, attr, spacing, tipoDato, opcional, rest, relName] = matchUno;
      const campoExtraido = relName.match(/_id([a-zA-Z0-9]+)To/);

      if (campoExtraido) {
        const nuevoNombre = generarNuevoNombreRelacion(tipoDato, campoExtraido[1]);
        if (attr !== nuevoNombre) {
          modificados++;
          const nombreConEspacios = `${nuevoNombre}${" ".repeat(Math.max(0, (attr + spacing).length - nuevoNombre.length))}`;
          const nuevaLinea = `${indent}${nombreConEspacios}${tipoDato}${opcional}${rest}`;
          const log = `🛠️ Línea ${i + 1}: (singular) ${attr} ➜ ${nuevoNombre} | Relación: '${relName}' | Original: '${originalLine.trim()}'`;
          console.log(log);
          logDetalles.push(log);
          return nuevaLinea;
        } else {
          const log = `✔️ Línea ${i + 1}: (singular) ${attr} ya está correcto | Relación: '${relName}'`;
          console.log(log);
          logDetalles.push(log);
        }
      }
      return line;
    }

    // --- Caso 3: Nuevas relaciones con fields:[id...] y references:[id...] ---
    const matchRelationField = line.match(/^(\s*)(\w+(?:_\w+)*)(\s+)(\w+(?:_\w+)*)(.*@relation\(fields: \[id(\w+)\], references: \[id\w+\].*)$/);
    if (matchRelationField) {
      totalMatches++;
      const [_, indent, attrA, spacing, tipoDato, rest, attrB] = matchRelationField;

      const cleanA = attrA.toLowerCase().replace(/_/g, "");
      const cleanB = attrB.toLowerCase().replace(/_/g, "");

      // Si ya son iguales, no hacer nada
      if (cleanA === cleanB) {
        const log = `✔️ Línea ${i + 1}: (relation-field) ${attrA} ya coincide con '${attrB}'`;
        console.log(log);
        logDetalles.push(log);
        return line;
      }

      // Caso especial: buscar en excepciones
      const excepcion = excepcionesRelacion.find((e) => e.atributo_original === attrA && e.campo === attrB);

      if (excepcion) {
        const nuevoNombre = excepcion.atributo_final;
        const nombreConEspacios = `${nuevoNombre}${" ".repeat(Math.max(0, (attrA + spacing).length - nuevoNombre.length))}`;
        const nuevaLinea = `${indent}${nombreConEspacios}${tipoDato}${rest}`;
        modificados++;
        const log = `🛠️ Línea ${i + 1}: (relation-field) (EXCEPTION) ${attrA} ➜ ${nuevoNombre} | Campo: '${attrB}' | Original: '${originalLine.trim()}'`;
        console.log(log);
        logDetalles.push(log);
        return nuevaLinea;
      }

      // Si attrB no comienza con attrA, no procesar
      if (!cleanB.startsWith(cleanA)) {
        const log = `⚠️ Línea ${i + 1}: (relation-field) '${attrB}' no comienza con '${attrA}' (limpio: '${cleanA}') | Original: '${originalLine.trim()}'`;
        console.log(log);
        logDetalles.push(log);
        return line;
      }

      // Separar attrA por palabras
      const palabrasA = attrA.toLowerCase().split("_");

      let index = 0;
      let nuevoNombreParts = [];

      for (let palabra of palabrasA) {
        const pos = cleanB.indexOf(palabra, index);
        if (pos === -1) break;
        nuevoNombreParts.push(palabra);
        index = pos + palabra.length;
      }

      const sufijo = cleanB.slice(index);
      if (sufijo) nuevoNombreParts.push(sufijo);

      const nuevoNombre = nuevoNombreParts.join("_");

      if (attrA !== nuevoNombre) {
        const nombreConEspacios = `${nuevoNombre}${" ".repeat(Math.max(0, (attrA + spacing).length - nuevoNombre.length))}`;
        const nuevaLinea = `${indent}${nombreConEspacios}${tipoDato}${rest}`;
        modificados++;
        //const log = `🛠️ Línea ${i + 1}: (relation-field) ${attrA} ➜ ${nuevoNombre} | A partir de: '${attrB}' | Original: '${originalLine.trim()}'`;
        //console.log(log);
        //logDetalles.push(log);
        return nuevaLinea;
      }
      return line;
    }

    return line;
  });

  const resumen = [`📊 Resumen del script: ${scriptName}`, `🔎 Total relaciones '@relation' detectadas: ${totalMatches}`, `✅ Atributos renombrados: ${modificados}`, `⚠️ Ya estaban correctos: ${totalMatches - modificados}`];

  resumen.forEach((line) => console.log(line));

  const finalLog = ["", `/// --- INICIO LOG DE SCRIPT: ${scriptName} ---`, `/// Fecha de ejecución: ${new Date().toLocaleString()}`, ...logDetalles.map((l) => `/// ${l}`), ...resumen.map((r) => `/// ${r}`), `/// --- FIN LOG DE SCRIPT ---`, ""];

  fs.writeFileSync(filePath, [...updatedLines, ...finalLog].join("\n"));

  return { totalMatches, modificados };
};

const run = (filePath) => {
  console.log(`📁 Ejecutando script: ${scriptName}`);
  console.log(`📂 Procesando archivo: ${filePath}`);
  configurarPluralizacionEspanol(pluralize);
  createBackup(filePath);
  renombrarAtributosEspeciales(filePath);
};

run(schemaFilePath);
