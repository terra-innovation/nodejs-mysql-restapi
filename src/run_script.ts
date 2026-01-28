// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env

import * as script from "#root/script_cron/email/send_email_venta_frio.js";

import * as df from "#src/utils/dateUtils.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const scriptName = path.basename(__filename);
//const __dirname = path.dirname(__filename);
//const jsonFilePath = path.join(__dirname, "BASE.txt");
//const jsonFilePath = path.resolve(process.cwd(), "temporal", "BASE.txt");

const jsonFilePath = path.resolve(process.cwd(), "temporal", "20260127_BASE_2.xlsx");

/**
 * Valida que el archivo exista y tenga permisos R/W
 */
function assertFileAccessible(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error("❌ Archivo no encontrado");
    console.error(`   Ruta esperada : ${filePath}`);
    process.exit(1);
  }

  try {
    fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    console.error("❌ Archivo sin permisos suficientes");
    console.error("   Se requiere lectura y escritura");
    console.error(`   Ruta : ${filePath}`);
    process.exit(1);
  }
}

async function main(filePath: string) {
  const startTime = Date.now();

  console.log("**************************************************");
  console.log(`📁 Script            : ${scriptName}`);
  console.log(`🕒 Inicio            : ${df.formatDateForLogLocale(new Date())}`);
  console.log(`📂 Archivo           : ${filePath}`);
  console.log(`📂 CWD               : ${process.cwd()}`);

  // 👉 VALIDACIÓN AQUÍ
  assertFileAccessible(filePath);

  try {
    await script.sendEmailingVentaEnFrioXLSX(filePath, startTime);
  } catch (err) {
    console.error("💥 Error fatal del script:", err);
  }
}

// Ejecutar en la consola: npx tsx .\tests\email\sendemail.test.ts
main(jsonFilePath);
