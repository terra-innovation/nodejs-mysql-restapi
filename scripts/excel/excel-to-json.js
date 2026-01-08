import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import xlsx from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const scriptName = path.basename(__filename);
const excelFilePath = path.resolve("scripts/excel", "BASE.xlsx");

// Función para convertir las fechas numéricas de Excel a formato ISO 8601 (YYYY-MM-DD)
const formatExcelDateToISO = (excelDate) => {
  if (typeof excelDate === "number" && !isNaN(excelDate)) {
    // Fecha base de Excel (1 de enero de 1900)
    const excelBaseDate = new Date(1900, 0, 1); // Año 1900, mes 0 (enero), día 1
    // Excel cuenta el día 1 como 1 (y no como 0), por lo que ajustamos sumando 1.
    excelBaseDate.setDate(excelBaseDate.getDate() + excelDate - 2); // Restamos 2 para ajustar la base (Excel cuenta 1900 como bisiesto)

    // Convertir a formato ISO 8601 (YYYY-MM-DD)
    return excelBaseDate.toISOString().split("T")[0]; // Solo la fecha (YYYY-MM-DD)
  }
  return ""; // Si no es un número válido, devolvemos una cadena vacía
};

const excelToJson = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[3];
  const sheet = workbook.Sheets[sheetName];

  let json = xlsx.utils.sheet_to_json(sheet, {
    defval: "", // columnas vacías como string vacío
  });

  // Formatear las fechas de cada registro
  json = json.map((item) => {
    if (item.fecha1 && !isNaN(item.fecha1)) {
      item.fecha1 = formatExcelDateToISO(item.fecha1);
    }
    if (item.fecha2 && !isNaN(item.fecha2)) {
      item.fecha2 = formatExcelDateToISO(item.fecha2);
    }
    return item;
  });

  // Obtener la ruta y el nombre del archivo Excel sin extensión
  const ruta = path.dirname(filePath);
  const nombreArchivo = path.basename(filePath, path.extname(filePath));

  // Generar el nombre del archivo .txt en la misma ubicación
  const archivoTxt = path.join(ruta, `${nombreArchivo}.txt`);

  fs.writeFileSync(archivoTxt, JSON.stringify(json, null, 2), "utf-8");

  console.log("Excel convertido a JSON");
  console.log("📊 Resumen de ejecución:");
  console.log(`📂 Hoja leida: ${sheetName}`);
  console.log(`📂 Archivo de salida: ${archivoTxt}`);
  console.log(`✅ Total de registros: ${json.length}`);
};

const run = (filePath) => {
  console.log(`📁 Ejecutando script: ${scriptName}`);
  console.log(`📂 Procesando archivo: ${filePath}`);

  excelToJson(filePath);
};

run(excelFilePath);
