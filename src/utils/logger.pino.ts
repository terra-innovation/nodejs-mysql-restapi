// src/utils/logger.pino.ts
import pino from "pino";
import { join } from "path";
import fs from "fs";
import { env } from "#src/config.js";
import type { Level } from "pino";
import { getContext } from "#src/utils/context/loggerContext.js";
import pretty from "pino-pretty";

type LogData = Record<string, unknown>;

const levelLabels: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

export function line(): string {
  const stack = new Error().stack?.split("\n") || [];
  const callerLine = stack.find((line, index) => index > 1 && line.includes("at")) || "";
  const match = callerLine.trim().match(/^at (.+?) \((.+):(\d+):(\d+)\)$/) || callerLine.trim().match(/^at (.+):(\d+):(\d+)$/);

  if (match) {
    if (match.length === 5) {
      const [, fn, file, line, col] = match;
      return `${fn} (${file}:${line})`;
    } else if (match.length === 4) {
      const [, file, line, col] = match;
      return `(anonymous) (${file}:${line})`;
    }
  }

  return "unknown";
}

// Crear directorio de logs si no existe
const logDir = join("logs", "pino");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const levelTransports: pino.StreamEntry[] = [];
const fileLogLevel = env.LOG_LEVEL_FILE || "info";

if (fileLogLevel !== "silent") {
  levelTransports.push({
    level: fileLogLevel as Level,
    stream: pino.transport({
      target: "pino-roll",
      options: {
        file: join(logDir, "ft-api-backend"), // ✅ Un solo archivo base
        frequency: "daily", // Rotación diaria
        mkdir: true,
        size: "10m", // Tamaño máximo por archivo
        limit: { count: 300 }, // Número máximo de archivos
        dateFormat: "yyyyMMdd",
        extension: ".log", // Extensión del archivo
      },
    }),
  });
}

const consoleLogLevel = env.LOG_LEVEL_CONSOLE || "debug";
if (consoleLogLevel !== "silent") {
  levelTransports.push({
    level: consoleLogLevel as Level,
    stream: pretty({
      colorize: true,
      ignore: "pid,hostname",
    }),
  });
}

export const loggerInstance = pino(
  {
    base: null,
    safe: true,
    level: pino.levels.values[env.LOG_LEVEL_FILE || "info"] < pino.levels.values[env.LOG_LEVEL_CONSOLE || "info"] ? env.LOG_LEVEL_FILE : env.LOG_LEVEL_CONSOLE,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    formatters: {
      level(label, number) {
        // Agregamos el atributo "log" con el texto del nivel
        return {
          log: levelLabels[number] || label,
          level: number, // mantenemos el número original
        };
      },
      log: (object) => {
        const store = getContext();
        return {
          ...object,
          ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
          env: env.NODE_ENV,
        };
      },
    },
  },
  pino.multistream(levelTransports)
);

function enrichLogData(location: string, extra: LogData = {}): LogData {
  const base: LogData = {
    location,
  };

  // ✅ Agregamos 'data' al final manualmente
  if (extra.data !== undefined) {
    return { ...base, data: extra.data };
  }

  if (extra.error !== undefined) {
    return { ...base, error: extra.error };
  }

  return { ...base };
}

function serializeError(err: Error): LogData {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

// Nueva firma: (location, message, data)
function logMethod(level: "trace" | "debug" | "info" | "warn" | "error" | "fatal") {
  return (location: string, msgOrError: string | Error, maybeData?: unknown) => {
    let message = "Log message";
    let logData: LogData = {};

    // Caso: logger.error(line(), err)
    if (msgOrError instanceof Error) {
      message = msgOrError.message;
      logData = { error: serializeError(msgOrError) };
    }

    // Caso: logger.error(line(), "mensaje", err | data)
    else if (typeof msgOrError === "string") {
      message = msgOrError;

      if (maybeData instanceof Error) {
        logData = { error: serializeError(maybeData) };
      } else {
        logData = { data: maybeData };
      }
    }

    loggerInstance[level](enrichLogData(location, logData), message);
  };
}

export const log = {
  trace: logMethod("trace"),
  debug: logMethod("debug"),
  info: logMethod("info"),
  warn: logMethod("warn"),
  error: logMethod("error"),
  fatal: logMethod("fatal"),
};
