import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { v4 as uuidv4 } from "uuid";
import { line, log } from "#src/utils/logger.pino.js";

/**
 * Guarda un contenido HTML en un archivo temporal del sistema y devuelve la ruta.
 *
 * @param htmlContent El contenido HTML a guardar.
 * @returns La ruta completa del archivo temporal.
 */
export const saveTempHtml = (htmlContent: string): string => {
  const tempDir = os.tmpdir();
  const fileName = `email_preview_${Date.now()}_${uuidv4().substring(0, 8)}.html`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, htmlContent, "utf-8");
  return filePath;
};

/**
 * Guarda el contenido HTML en un archivo temporal y muestra un enlace clickable en la consola.
 *
 * @param htmlContent El contenido HTML a mostrar.
 */
export const logHtmlLink = (htmlContent: string): void => {
  if (!htmlContent) {
    console.log("No hay contenido HTML para mostrar.");
    return;
  }

  try {
    const filePath = saveTempHtml(htmlContent);
    const fileUrl = pathToFileURL(filePath).toString();

    log.debug(line(), "Archivo HTML generado: ", fileUrl);
  } catch (error) {
    console.error("Error al generar archivo temporal HTML:", error);
  }
};

/**
 * Guarda un contenido de texto en un archivo temporal del sistema y devuelve la ruta.
 *
 * @param txtContent El contenido de texto a guardar.
 * @returns La ruta completa del archivo temporal.
 */
export const saveTempTxt = (txtContent: string): string => {
  const tempDir = os.tmpdir();
  const fileName = `txt_preview_${Date.now()}_${uuidv4().substring(0, 8)}.txt`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, txtContent, "utf-8");
  return filePath;
};

/**
 * Guarda el contenido de texto en un archivo temporal y muestra un enlace clickable en la consola.
 *
 * @param txtContent El contenido de texto a mostrar.
 */
export const logTxtLink = (txtContent: string): void => {
  if (!txtContent) {
    console.log("No hay contenido de texto para mostrar.");
    return;
  }

  try {
    const filePath = saveTempTxt(txtContent);
    const fileUrl = pathToFileURL(filePath).toString();

    log.debug(line(), "Archivo TXT generado: ", fileUrl);
  } catch (error) {
    console.error("Error al generar archivo temporal TXT:", error);
  }
};
