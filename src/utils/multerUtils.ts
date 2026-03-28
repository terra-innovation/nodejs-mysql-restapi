
/**
 * Corrige la codificación del nombre original del archivo.
 * Multer interpreta los headers de multipart/form-data como ISO-8859-1 (Latin1),
 * pero los navegadores modernos envían los nombres en UTF-8.
 */
export const corregirNombreArchivo = (file: any) => {
  if (!file || !file.originalname || file._encoding_corregida) {
    return;
  }

  // Patrón para detectar secuencias que parecen UTF-8 mal interpretado como Latin1.
  // Cubre secuencias de 2 bytes (tildes, ñ), 3 bytes (Euro €, símbolos) y 4 bytes (Emojis).
  const tieneArtefactosUtf8 = /[\u00C2-\u00DF][\u0080-\u00BF]|[\u00E0-\u00EF][\u0080-\u00BF]{2}|[\u00F0-\u00F4][\u0080-\u00BF]{3}/.test(file.originalname);

  if (tieneArtefactosUtf8) {
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
  }

  file._encoding_corregida = true;
};
