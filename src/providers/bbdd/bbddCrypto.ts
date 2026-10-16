import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { ClientError } from "#src/utils/CustomErrors.js";

export interface SecretEnvelope {
  password_cifrado: Uint8Array<ArrayBuffer>;
  password_nonce: Uint8Array<ArrayBuffer>;
  password_tag: Uint8Array<ArrayBuffer>;
  clave_version: string;
  cifrado_version: number;
}
function key(version: string) {
  try {
    const keys = JSON.parse(process.env.BBDD_KEYS ?? process.env.BANK_SYNC_KEYS ?? "{}");
    if (typeof keys[version] !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(keys[version])) throw new Error();
    const value = Buffer.from(keys[version], "base64");
    if (value.length !== 32) throw new Error();
    return value;
  } catch {
    throw new ClientError("Configure BBDD_KEYS con la versión requerida y una clave AES de 32 bytes en Base64 en el servidor. No introduzca claves en esta pantalla.", 503);
  }
}
const aad = (uuid: string, version: string) => Buffer.from(JSON.stringify(["FT-BANCO-CONEXION", "1", uuid, "password", version]), "utf8");
export function cifrarPassword(password: string, uuid: string): SecretEnvelope {
  const version = process.env.BBDD_ACTIVE_KEY ?? process.env.BANK_SYNC_ACTIVE_KEY ?? "";
  if (!version || version.length > 50) throw new ClientError("Configure BBDD_ACTIVE_KEY con una versión presente en BBDD_KEYS para poder cifrar y guardar contraseñas.", 503);
  if (!password || Buffer.byteLength(password, "utf8") > 2048) throw new ClientError("La contraseña debe contener entre 1 y 2048 bytes UTF-8.", 422);
  const nonce = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(version), nonce, { authTagLength: 16 });
  cipher.setAAD(aad(uuid, version));
  return { password_cifrado: Uint8Array.from(Buffer.concat([cipher.update(password, "utf8"), cipher.final()])), password_nonce: Uint8Array.from(nonce), password_tag: Uint8Array.from(cipher.getAuthTag()), clave_version: version, cifrado_version: 1 };
}
export function descifrarPassword(secret: SecretEnvelope, uuid: string): string {
  try {
    if (secret.cifrado_version !== 1 || secret.password_nonce.length !== 12 || secret.password_tag.length !== 16) throw new Error();
    const decipher = createDecipheriv("aes-256-gcm", key(secret.clave_version), secret.password_nonce, { authTagLength: 16 });
    decipher.setAAD(aad(uuid, secret.clave_version));
    decipher.setAuthTag(secret.password_tag);
    return Buffer.concat([decipher.update(secret.password_cifrado), decipher.final()]).toString("utf8");
  } catch (error) {
    if (error instanceof ClientError) throw error;
    throw new ClientError("No se pudo autenticar la contraseña guardada. Revise la versión en BBDD_KEYS; si cambió la clave, restaure la anterior o guarde una contraseña nueva.", 503);
  }
}
export function verificarCifrado() {
  const version = process.env.BBDD_ACTIVE_KEY ?? process.env.BANK_SYNC_ACTIVE_KEY ?? "";
  if (!version) throw new ClientError("Falta BBDD_ACTIVE_KEY. Configure una versión presente en BBDD_KEYS antes de guardar una contraseña nueva.", 503);
  key(version);
}
