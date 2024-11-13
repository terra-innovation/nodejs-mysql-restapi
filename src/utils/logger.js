import winston from "winston";
import { format } from "winston";
import { transports } from "winston";
import path from "path";
import chalk from "chalk";
import util from "util";

// Función para generar la fecha en formato requerido
const generateLogFilename = (level) => {
  const date = new Date();
  const dateString =
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_` +
    `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}_` +
    `${date.getMilliseconds()}`;
  return `${level}_${dateString}.log`;
};

// Formato JSON para los logs
const jsonFormat = format.printf(({ timestamp, level, message, requestId, userId, durationMs, context }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    requestId,
    userId,
    durationMs,
    context,
  });
});

// Crear el logger de Winston
const logger = winston.createLogger({
  level: "silly",
  format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSSZ" }), jsonFormat),
  transports: [
    // Log en consola (en formato texto plano)
    new transports.Console({
      level: "silly",
      stderrLevels: ["error", "warn"],
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, requestId, userId, durationMs, context, ...metadata }) => {
          return `[${chalk.green(timestamp)}] ${level}: ${message}`;
        })
      ),
    }),
    // Log para nivel "silly"
    new transports.File({
      filename: path.join("logs", generateLogFilename("silly")),
      level: "silly",
      maxsize: 2 * 1024 * 1024, // 2MB
      maxFiles: 10,
      tailable: true,
    }),
    // Log para nivel "debug"
    new transports.File({
      filename: path.join("logs", generateLogFilename("debug")),
      level: "debug",
      maxsize: 3 * 1024 * 1024, // 3MB
      maxFiles: 10,
      tailable: true,
    }),
    // Log para nivel "warn"
    new transports.File({
      filename: path.join("logs", generateLogFilename("warn")),
      level: "warn",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
      tailable: true,
    }),
    // Log para nivel "error"
    new transports.File({
      filename: path.join("logs", generateLogFilename("error")),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Guardar referencia al método log original
const originalLogMethod = logger.log.bind(logger);

// Función auxiliar para concatenar argumentos
function logSimulateConsole(level, ...args) {
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
  originalLogMethod({ level, message }); // Usar el método original
}

// Sobreescribir  para usar `logSimulateConsole`
logger.log = (level, ...args) => logSimulateConsole(level, ...args);

// Sobreescribir  para usar `logSimulateConsole`
logger.silly = (...args) => logSimulateConsole("silly", ...args);
logger.debug = (...args) => logSimulateConsole("debug", ...args);
logger.verbose = (...args) => logSimulateConsole("verbose", ...args);
logger.http = (...args) => logSimulateConsole("http", ...args);
logger.info = (...args) => logSimulateConsole("info", ...args);
logger.warn = (...args) => logSimulateConsole("warn", ...args);
logger.error = (...args) => logSimulateConsole("error", ...args);

//logger.log = (level, ...args) => logWithWinston(level, ...args);

/* Cómo usar
logger.silly("Este es un mensaje muy detallado (silly)");
logger.debug("Este es un mensaje de debug");
logger.verbose("Este es un mensaje verbose");
logger.http("Este es un mensaje http");
logger.info("Este es un mensaje informativo");
logger.warn("Este es un mensaje de advertencia");
logger.error("Este es un mensaje de error");

const user = { id: 123, name: "Alice" };
const action = { type: "login", time: Date.now() };
logger.info("User info:", user, action);
logger.warn("Warning: unusual activity detected", { ip: "192.168.1.1" });
logger.error("Error processing request", new Error("Sample error"));

*/

export default logger;
