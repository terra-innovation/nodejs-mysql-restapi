import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const root = "/opt/finanzatech/ft-app-backend";
export function validateEnvironment(values) {
  let url;
  try {
    url = new URL(values.PRISMA_DATABASE_FACTORING_URL);
  } catch {
    throw new Error("URL de ensayo inválida; no se muestra su valor.");
  }
  if (!["mysql:", "mariadb:"].includes(url.protocol) || url.hostname !== "db" || (url.port && url.port !== "3306") || url.pathname !== "/ft_rehearsal" || url.username !== "ft_lab" || values.NODE_ENV !== "production" || values.PORT !== "5000" || values.TELEGRAM_ACTIVE !== "false") {
    throw new Error("Configuración rechazada: solo se permite la base interna ft_rehearsal, modo production, puerto 5000 y Telegram desactivado.");
  }
  for (const key of ["DECOLECTA_BASE_URL", "APISPERU_BASE_URL"]) {
    if (values[key] !== "http://127.0.0.1:1") throw new Error("Proveedores externos rechazados en el ensayo.");
  }
}
export async function guard() {
  const require = createRequire(`${root}/package.json`);
  const dotenv = require("dotenv");
  validateEnvironment(dotenv.parse(await readFile(`${root}/.env`)));
}
if (process.argv[2] === "check") {
  await guard();
  console.log("Destino aislado verificado; no se abrió conexión SQL.");
}
