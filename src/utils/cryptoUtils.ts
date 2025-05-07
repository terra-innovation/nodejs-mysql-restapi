// cryptoUtils.js
import crypto from "crypto";

// Función para generar una clave de 32 bytes a partir de la clave original
const generateKey = (key) => {
  return crypto.createHash("sha256").update(key).digest(); // Genera una clave de 32 bytes
};

const separador = "|";

export const encryptText = (text, encryptionKey) => {
  const iv = crypto.randomBytes(16); // Vector de inicialización
  const cipher = crypto.createCipheriv("aes-256-cbc", generateKey(encryptionKey), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Devolvemos el IV y el texto cifrado
  return iv.toString("hex") + separador + encrypted;
};

export const decryptText = (encryptedText, encryptionKey) => {
  if (!encryptedText.includes(separador)) {
    throw new Error("Texto encriptado inválido. Debe contener '" + separador + "' para separar IV y texto cifrado.");
  }

  const [ivHex, encrypted] = encryptedText.split(separador);

  // Verifica que el IV sea válido
  if (ivHex.length !== 32) {
    throw new Error("IV inválido. Debe ser de 16 bytes en formato hexadecimal.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", generateKey(encryptionKey), iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
