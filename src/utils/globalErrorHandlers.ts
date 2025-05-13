import { log, line } from "#src/utils/logger.pino.js";

// Captura global de errores no controlados en caso de que Winston no esté configurado
process.on("uncaughtException", (err: unknown) => {
  // Si el error es una instancia de Error, capturamos el stack
  if (err instanceof Error) {
    // Logueamos el error con el stack trace
    log.error(line(), "Uncaught Exception:", err);
  } else {
    // Si no es un objeto Error, logueamos el error de forma general
    log.error(line(), "Uncaught non-error type Exception:", err);
  }
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  if (reason instanceof Error) {
    // Si el 'reason' es una instancia de Error, podemos registrar el stack
    log.error(line(), "Unhandled Rejection at Promise:", { promise, reason });
  } else {
    // Si el 'reason' no es un error, solo logueamos el valor
    log.error(line(), "Unhandled Rejection at Promise (non-error type): ", { promise, reason });
  }
});
