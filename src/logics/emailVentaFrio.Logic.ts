import { DateTime } from "luxon";
import xlsx from "xlsx";
import fs from "fs";

import * as emailService from "#src/services/email.Service.js";
import { line, log } from "#src/utils/logger.pino.js";

// ============================================================================
// Tipos
// ============================================================================

export interface VentaFrioRecord {
  ruc: string;
  razon_social: string;
  correo: string;
  accion1: string;
  estado1: string;
  fecha1: number | null; // Fecha Excel (días desde 1899-12-30) o ISO string
  hora1: number | null;  // Hora Excel (fracción del día)
  resultado1: string;
}

// ============================================================================
// Helpers internos
// ============================================================================

/**
 * Convierte un DateTime de Luxon a número de fecha Excel (días desde 1899-12-30).
 */
const toExcelDate = (dt: DateTime): number => dt.toMillis() / 86400000 + 25569;

/**
 * Convierte un DateTime de Luxon a fracción de día (hora Excel).
 */
const toExcelTime = (dt: DateTime): number =>
  (dt.hour * 3600 + dt.minute * 60 + dt.second) / 86400;

// ============================================================================
// Lógica de negocio — Email Venta en Frío (XLSX)
// ============================================================================

/**
 * Envía un email de venta en frío al primer registro pendiente de un archivo Excel,
 * actualiza el estado del registro y sobrescribe el mismo archivo.
 *
 * Estrategia: Lee el Excel, filtra registros con accion1="Enviar" y sin estado1,
 * toma el primero, envía el email y actualiza las columnas de resultado.
 *
 * @param filePath  Ruta absoluta al archivo .xlsx
 * @returns Objeto con resumen de la ejecución o null si no había pendientes
 */
export const sendEmailVentaFrioXlsxLogic = async (
  filePath: string
): Promise<{ ruc: string; razon_social: string; correo: string; resultado: "OK" | "ERROR"; error?: string } | null> => {
  log.debug(line(), `logic::sendEmailVentaFrioXlsxLogic - archivo: ${filePath}`);

  // 1. Leer Excel
  const workbook = xlsx.readFile(filePath);
  const sheetName = "Consolidado";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    log.warn(line(), `Hoja "${sheetName}" no encontrada en el archivo: ${filePath}`);
    throw new Error(`No existe la hoja "${sheetName}" en el archivo Excel`);
  }

  // 2. Convertir a JSON
  const data = xlsx.utils.sheet_to_json<VentaFrioRecord>(sheet, { defval: null });
  log.info(line(), `Registros totales en Excel: ${data.length}`);

  // 3. Filtrar pendientes
  const pendientes = data.filter(
    (r) => r.accion1 === "Enviar" && (!r.estado1 || r.estado1 === "")
  );
  log.info(line(), `Registros pendientes: ${pendientes.length}`);

  if (pendientes.length === 0) {
    log.info(line(), "No hay registros pendientes para procesar");
    return null;
  }

  // 4. Tomar el primer pendiente
  const r = pendientes[0];
  log.info(line(), `Procesando registro — RUC: ${r.ruc} | Empresa: ${r.razon_social} | Correo: ${r.correo}`);

  const now = DateTime.now().setZone("America/Lima");

  try {
    // 5. Enviar email
    await emailService.sendEmailingVentaEnFrio(r.correo, {});

    r.estado1 = "Enviado";
    r.resultado1 = "OK";
    r.fecha1 = toExcelDate(now);
    r.hora1 = toExcelTime(now);

    log.info(line(), `Email enviado exitosamente a ${r.correo}`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    r.estado1 = "Enviado";
    r.resultado1 = "ERROR";
    r.fecha1 = toExcelDate(now);
    r.hora1 = toExcelTime(now);

    log.error(line(), `Error al enviar email a ${r.correo}: ${msg}`);

    // 6. Guardar el Excel incluso si hubo error (para registrar el intento)
    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    xlsx.writeFile(workbook, filePath);

    return { ruc: r.ruc, razon_social: r.razon_social, correo: r.correo, resultado: "ERROR", error: msg };
  }

  // 6. Guardar el Excel actualizado
  const newSheet = xlsx.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;
  xlsx.writeFile(workbook, filePath);
  log.info(line(), `Archivo Excel actualizado: ${filePath}`);

  return { ruc: r.ruc, razon_social: r.razon_social, correo: r.correo, resultado: "OK" };
};

// ============================================================================
// Lógica de negocio — Email Venta en Frío (JSON)
// ============================================================================

/**
 * Versión JSON: misma lógica pero el origen de datos es un archivo .json en lugar de Excel.
 */
export const sendEmailVentaFrioJsonLogic = async (
  filePath: string
): Promise<{ ruc: string; razon_social: string; correo: string; resultado: "OK" | "ERROR"; error?: string } | null> => {
  log.debug(line(), `logic::sendEmailVentaFrioJsonLogic - archivo: ${filePath}`);

  const raw = fs.readFileSync(filePath, "utf-8");
  const data: VentaFrioRecord[] = JSON.parse(raw);
  log.info(line(), `Registros totales en JSON: ${data.length}`);

  const pendientes = data.filter(
    (r) => r.resultado1 === "Enviar" && (r.estado1 === "" || r.estado1 === null)
  );
  log.info(line(), `Registros pendientes: ${pendientes.length}`);

  if (pendientes.length === 0) {
    log.info(line(), "No hay registros pendientes para procesar");
    return null;
  }

  const r = pendientes[0];
  log.info(line(), `Procesando — RUC: ${r.ruc} | Correo: ${r.correo}`);

  const now = DateTime.now().setZone("America/Lima").toISO();

  try {
    await emailService.sendEmailingVentaEnFrio(r.correo, {});
    r.estado1 = "Enviado";
    r.resultado1 = "OK";
    r.fecha1 = now as any;
    log.info(line(), `Email enviado exitosamente a ${r.correo}`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    r.estado1 = "Enviado";
    r.resultado1 = "ERROR";
    r.fecha1 = now as any;
    log.error(line(), `Error al enviar email a ${r.correo}: ${msg}`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return { ruc: r.ruc, razon_social: r.razon_social, correo: r.correo, resultado: "ERROR", error: msg };
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  log.info(line(), `Archivo JSON actualizado: ${filePath}`);

  return { ruc: r.ruc, razon_social: r.razon_social, correo: r.correo, resultado: "OK" };
};
