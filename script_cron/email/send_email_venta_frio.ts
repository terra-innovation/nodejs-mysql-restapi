// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env
import { DateTime } from "luxon";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import xlsx from "xlsx";
import * as emailService from "#src/services/email.Service.js";

import fs from "fs";

interface VentaFrioRecord {
  ruc: string;
  razon_social: string;
  correo: string;
  accion1: string;
  estado1: string;
  fecha1: number | null; // ISO o yyyy-mm-dd
  hora1: number | null; // ISO o HH:mm:ss
  resultado1: string;
}

/**
 * Convierte DateTime a fecha Excel (días desde 1899-12-30)
 */
const toExcelDate = (dt: DateTime): number => dt.toMillis() / 86400000 + 25569;

/**
 * Convierte DateTime a hora Excel (fracción del día)
 */
const toExcelTime = (dt: DateTime): number => (dt.hour * 3600 + dt.minute * 60 + dt.second) / 86400;

export const sendEmailingVentaEnFrioXLSX = async (filePath: string, startTime: number) => {
  // 1. Leer Excel
  const workbook = xlsx.readFile(filePath);
  const sheetName = "Consolidado";

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.log(`❌ No existe la hoja "${sheetName}"`);
    return;
  }

  // 2. Convertir hoja a JSON (solo columnas existentes)
  const data = xlsx.utils.sheet_to_json<VentaFrioRecord>(sheet, {
    defval: null,
  });

  console.log(`📊 Registros totales  : ${data.length}`);

  // 3. Filtrar pendientes
  const pendientes = data.filter((r) => r.accion1 === "Enviar" && (!r.estado1 || r.estado1 === ""));

  console.log(`📌 Pendientes        : ${pendientes.length}`);

  if (pendientes.length === 0) {
    console.log("📭 No hay registros para procesar");
    return;
  }

  // 4. Seleccionar primer registro pendiente
  const r = pendientes[0];

  console.log("📨 Registro seleccionado");
  console.log(`   • RUC             : ${r.ruc}`);
  console.log(`   • Empresa         : ${r.razon_social}`);
  console.log(`   • Correo          : ${r.correo}`);

  const now = DateTime.now().setZone("America/Lima");
  const started = Date.now();

  try {
    console.log("🚧 Enviando correo...");
    await emailService.sendEmailingVentaEnFrio(r.correo, {});

    r.estado1 = "Enviado";
    r.resultado1 = "OK";
    r.fecha1 = toExcelDate(now);
    r.hora1 = toExcelTime(now);

    console.log("✅ Resultado         : OK");
  } catch (error) {
    r.estado1 = "Enviado";
    r.resultado1 = "ERROR";
    r.fecha1 = toExcelDate(now);
    r.hora1 = toExcelTime(now);

    console.error("❌ Resultado         : ERROR");
    console.error(error);
  }

  // 5. Volver a escribir la hoja Consolidado
  const newSheet = xlsx.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  // 6. Guardar el mismo archivo
  xlsx.writeFile(workbook, filePath);

  console.log("💾 Registro guardado en Excel");
  console.log(`⏱️ Duración         : ${Date.now() - started} ms`);
};
export const sendEmailingVentaEnFrioJSON = async (filePath: string, startTime: number) => {
  // 1. Leer archivo
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: VentaFrioRecord[] = JSON.parse(raw);

  console.log(`📊 Registros totales  : ${data.length}`);

  // 2. Filtrar
  const pendientes = data.filter((r) => r.resultado1 === "Enviar" && (r.estado1 === "" || r.estado1 === null));

  console.log(`📌 Pendientes        : ${pendientes.length}`);

  if (pendientes.length === 0) {
    console.log("📭 No hay registros para procesar");
    return;
  }

  // 3. Seleccionar registro
  const r = pendientes[0];

  console.log("📨 Registro seleccionado");
  console.log(`   • RUC             : ${r.ruc}`);
  console.log(`   • Empresa         : ${r.razon_social}`);
  console.log(`   • Correo          : ${r.correo}`);
  console.log(`   • Fecha envío 1   : ${r.fecha1}`);

  const now = DateTime.now().setZone("America/Lima").toISO();
  const started = Date.now();

  try {
    console.log("🚧 Enviando correo...");
    await emailService.sendEmailingVentaEnFrio(r.correo, {});

    r.estado1 = "Enviado";
    r.resultado1 = "OK";
    r.fecha1 = now;

    console.log("✅ Resultado         : OK");
  } catch (error) {
    r.estado1 = "Enviado";
    r.resultado1 = "ERROR";
    r.fecha1 = now;

    console.error("❌ Resultado         : ERROR");
    console.error(error);
  }

  // 4. Guardar
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log("💾 Registro guardado");

  console.log(`⏱️ Duración         : ${Date.now() - started} ms`);
};
