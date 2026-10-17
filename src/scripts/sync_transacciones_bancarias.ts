import { sincronizacionBanco } from "#src/types/TransaccionBancaria.schemas.js";
import { sincronizar } from "#src/services/banca/transaccionbancaria.Service.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";

// La programación y la cuenta técnica se administran fuera de la aplicación.
try {
  const user = Number(process.env.BANK_SYNC_ACTOR_ID);
  if (!Number.isInteger(user) || user <= 0) throw new Error("Cuenta técnica no configurada.");
  const input = sincronizacionBanco.parse({ conexion: process.env.BANK_SYNC_CONNECTION_UUID, desde: process.env.BANK_SYNC_FROM || null, hasta: process.env.BANK_SYNC_TO || null, historico: false });
  const result = await sincronizar(input, user, true);
  console.info(JSON.stringify({ code: result.code, resultado: result.resultado, filas_leidas: result.filas_leidas, filas_insertadas: result.filas_insertadas, filas_incidencia: result.filas_incidencia }));
  if (result.resultado !== "EXITOSA") process.exitCode = 1;
} catch {
  console.error("No se pudo ejecutar la sincronización bancaria programada. Revise la configuración y el log de ejecuciones.");
  process.exitCode = 1;
} finally {
  await prismaFT.disconnectDatabase();
}
