import fs from "fs";
import path from "path";
import { log, line } from "#src/utils/logger.pino.js";

// Ruta relativa a la raíz del proyecto
const configPath = path.join(process.cwd(), "security", "ip");

function loadIpList(filename: string): string[] {
  const filePath = path.join(configPath, filename);

  if (!fs.existsSync(filePath)) {
    log.warn(line(), `[Security] Archivo ${filename} no encontrado. Se bloqueara todo el acceso.`);
    return null; // No hay archivo = bloquea todo
  }

  const lines = fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return lines;
}

export const whitelist = loadIpList("whitelist.txt");
export const blacklist = loadIpList("blacklist.txt");

export function isWhitelistAll(): boolean {
  return whitelist?.includes("*") ?? false;
}

export function isBlacklistAll(): boolean {
  return blacklist?.includes("*") ?? false;
}

// Mensajes de estado
if (whitelist === null) {
  log.error(line(), "[Security] No se pudo cargar la whitelist. Todas las IPs seran bloqueadas.");
} else if (whitelist.includes("*")) {
  log.info(line(), `[Security] Whitelist activa: se permite cualquier IP (*).`);
} else if (whitelist.length === 0) {
  log.warn(line(), "[Security] Whitelist vacia: se bloquearan todas las IPs.");
} else {
  log.info(line(), `[Security] Whitelist cargada con ${whitelist.length} IPs/rangos.`);
}

if (blacklist === null) {
  log.error(line(), "[Security] No se pudo cargar la blacklist. Se ignorará bloqueo por IPs especificas.");
} else if (blacklist.includes("*")) {
  log.warn(line(), `[Security] Blacklist activa: se bloquea cualquier IP (*).`);
} else if (blacklist.length === 0) {
  log.info(line(), "[Security] Blacklist vacia: no hay IPs bloqueadas.");
} else {
  log.info(line(), `[Security] Blacklist cargada con ${blacklist.length} IPs/rangos.`);
}
