import winston, { format, transports } from "winston";
import path from "path";
import chalk from "chalk";
import util from "util";
import DailyRotateFile from "winston-daily-rotate-file";
import { Line, Log } from "./logger.types.js";

// Formato JSON para los logs
const jsonFormatMorgan = format.printf(({ timestamp, level, message, ms }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ms,
  });
});

// Crear el logger de Winston para Morgan
export const loggerMorgan = winston.createLogger({
  level: "silly",
  format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSSZ" }), jsonFormatMorgan),
  transports: [
    // Log en consola (en formato texto plano)
    new transports.Console({
      level: "silly",
      stderrLevels: ["error", "warn"], //se utiliza para especificar los niveles de log que deben ser enviados al flujo de error estándar (stderr) en lugar del flujo estándar (stdout)
      format: format.combine(
        format.colorize(),
        format.ms(), // Number of milliseconds since the previous log message.
        format.printf(({ timestamp, level, message, ms }) => {
          return `[${chalk.green(timestamp)}] ${level}: ${message} ${ms}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join("logs", "morgan_silly_%DATE%.log"), // Nombre de archivo con marca de fecha
      datePattern: "YYYYMMDD_HH", // Patrón de fecha personalizado
      level: "silly", // Nivel
      maxSize: "5m", // Tamaño máximo por archivo
      maxFiles: "2d", // Guardar los últimos x días de logs
      zippedArchive: true, // Comprimir archivos rotados en .gz
    }),
  ],
  exitOnError: false, // Evita que la aplicación se cierre en excepciones no controladas
});

// Formato JSON para los logs
const jsonFormatDefault = format.printf(({ timestamp, file, level, message, ms }: Log) => {
  return JSON.stringify({
    timestamp,
    archivo: file ? file.archivo : "desconocido",
    linea: file ? file.linea : "desconocido",
    level,
    message,
    ms,
  });
});

// Crear el logger de Winston
const logger = winston.createLogger({
  level: "silly",
  format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSSZ" }), jsonFormatDefault),
  transports: [
    // Log en consola (en formato texto plano)
    new transports.Console({
      level: "silly",
      stderrLevels: ["error", "warn"],
      format: format.combine(
        format.colorize(),
        format.ms(), // Number of milliseconds since the previous log message.
        format.printf(({ timestamp, file, level, message, ms }: Log) => {
          return `[${chalk.green(timestamp)}] ${level}: ${message} ${ms} (${file.ruta}/${file.archivo}:${file.linea})`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join("logs", "silly_%DATE%.log"), // Nombre de archivo con marca de fecha
      datePattern: "YYYYMMDD_HH", // Patrón de fecha personalizado
      level: "silly", // Nivel
      maxSize: "5m", // Tamaño máximo por archivo
      maxFiles: "2d", // Guardar los últimos x días de logs
      zippedArchive: true, // Comprimir archivos rotados en .gz
    }),
    new DailyRotateFile({
      filename: path.join("logs", "warn_%DATE%.log"), // Nombre de archivo con marca de fecha
      datePattern: "YYYYMMDD", // Patrón de fecha personalizado
      level: "warn", // Nivel
      maxSize: "5m", // Tamaño máximo por archivo
      maxFiles: "3d", // Guardar los últimos x días de logs
      zippedArchive: true, // Comprimir archivos rotados en .gz
    }),
    new DailyRotateFile({
      filename: path.join("logs", "error_%DATE%.log"), // Nombre de archivo con marca de fecha
      datePattern: "YYYYMMDD", // Patrón de fecha personalizado
      level: "error", // Nivel
      maxSize: "5m", // Tamaño máximo por archivo
      maxFiles: "3d", // Guardar los últimos x días de logs
      zippedArchive: true, // Comprimir archivos rotados en .gz
    }),
  ],
  exitOnError: false, // Evita que la aplicación se cierre en excepciones no controladas
});

// Guardar referencia al método log original
const originalLogMethod = logger.log.bind(logger);

// Función auxiliar para concatenar argumentos
function logSimulateConsole(level, file, ...args) {
  const message = args
    .map((arg) => {
      if (arg instanceof Error) {
        // Extrae el mensaje y stack del error para log detallado
        return `${arg.message}\n${arg.stack}`;
      } else if (typeof arg === "object") {
        // Serializa el objeto en JSON
        return util.inspect(arg, { depth: null, colors: true });
      }
      return arg;
    })
    .join(`\n`);
  originalLogMethod({ level, file, message }); // Usar el método original
}

// Sobreescribir  para usar `logSimulateConsole`
//logger.log = (level, ...args) => logSimulateConsole(level, ...args);

// Sobreescribir  para usar `logSimulateConsole`
//logger.silly = (...args) => logSimulateConsole("silly", ...args);
//logger.debug = (...args) => logSimulateConsole("debug", ...args);
//logger.verbose = (...args) => logSimulateConsole("verbose", ...args);
//logger.http = (...args) => logSimulateConsole("http", ...args);
//logger.info = (file, ...args:): void => logSimulateConsole("info", file, ...args);
//logger.warn = (...args) => logSimulateConsole("warn", ...args);
//logger.error = (...args) => logSimulateConsole("error", ...args);

export function logSilly(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("silly", line, message, ...args);
}

export function logDebug(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("debug", line, message, ...args);
}

export function logVerbose(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("verbose", line, message, ...args);
}

export function logHttp(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("http", line, message, ...args);
}

export function logInfo(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("info", line, message, ...args);
}

export function logWarn(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("warn", line, message, ...args);
}

export function logError(line: Line, message: string, ...args: unknown[]): void {
  logSimulateConsole("error", line, message, ...args);
}

export const log = {
  silly: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("silly", line, message, ...args);
  },
  debug: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("debug", line, message, ...args);
  },
  verbose: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("verbose", line, message, ...args);
  },
  http: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("http", line, message, ...args);
  },
  info: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("info", line, message, ...args);
  },
  warn: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("warn", line, message, ...args);
  },
  error: (line: Line, message: string, ...args: unknown[]) => {
    logSimulateConsole("error", line, message, ...args);
  },
};

// Captura global de errores no controlados en caso de que Winston no esté configurado
process.on("uncaughtException", (err) => {
  // Si el error es una instancia de Error, capturamos el stack
  if (err instanceof Error) {
    // Logueamos el error con el stack trace
    logger.error("Uncaught Exception:", err.message, "\nStack Trace:", err.stack);
  } else {
    // Si no es un objeto Error, logueamos el error de forma general
    logger.error("Uncaught Exception:", err);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  if (reason instanceof Error) {
    // Si el 'reason' es una instancia de Error, podemos registrar el stack
    logger.error("Unhandled Rejection at Promise:", promise, "Reason:", reason.stack || reason);
  } else {
    // Si el 'reason' no es un error, solo logueamos el valor
    logger.error("Unhandled Rejection at Promise:", promise, "Reason:", reason);
  }
});

export function line(): Line {
  const error = new Error();
  const stackLines = error.stack.split("\n");

  // La segunda línea contiene la información sobre la invocación
  const invocacion = stackLines[2];

  // Expresión regular para extraer la ruta del archivo y el nombre del archivo
  const regex = /file:\/\/(?:\/)?([A-Za-z]:[^:]+)\/([^:]+):(\d+):(\d+)/;
  const match = invocacion.match(regex);

  if (match) {
    const ruta = match[1]; // La ruta donde se encuentra el archivo (sin el nombre)
    const archivo = match[2]; // El nombre del archivo
    const linea = match[3]; // El número de la línea
    const columna = match[4]; // El número de la columna (opcional)

    return { ruta, archivo, linea, columna };
  }
  return { ruta: "unknown", archivo: "unknown", linea: "unknown", columna: "unknown" };
}

/* Cómo usar
log.silly(line(), "Este es un mensaje muy detallado (silly)");
log.debug(line(), "Este es un mensaje de debug");
log.verbose(line(), "Este es un mensaje verbose");
log.http(line(), "Este es un mensaje http");
log.info(line(), "Este es un mensaje informativo");
log.warn(line(), "Este es un mensaje de advertencia");
log.error(line(), "Este es un mensaje de error");

const user = { id: 123, name: "Alice" };
const action = { type: "login", time: Date.now() };
log.info(line(), "User info:", user, action);
log.warn(line(), "Warning: unusual activity detected", { ip: "192.168.1.1" });
logger.error("Error processing request", new Error("Sample error"));

*/

export default logger;
