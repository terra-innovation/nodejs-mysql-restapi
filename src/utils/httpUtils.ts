import { promisify } from "util";

/**
 * Envía un archivo como respuesta HTTP de forma asíncrona.
 * @param {object} req - Objeto de solicitud HTTP.
 * @param {object} res - Objeto de respuesta HTTP.
 * @param {string} filePath - Ruta del archivo a enviar.
 * @returns {Promise<void>} Promesa que se resuelve cuando el archivo se envía.
 */
export const sendFileAsync = async (req, res, filePath) => {
  const sendFile = promisify(res.sendFile.bind(res)); // Vinculamos res.sendFile al contexto de res
  return sendFile(filePath); // Llamamos a la versión promisificada
};

export const setDownloadHeaders = (res, fileName) => {
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
};
