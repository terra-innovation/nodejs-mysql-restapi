// src/utils/logger.pino.ts
import pino from "pino";
import { join } from "path";
import fs from "fs";

type LogData = Record<string, unknown>;

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

function getUserId(): number | string | null {
  try {
    return globalThis.session_user?.usuario?._idusuario ?? null;
  } catch {
    return null;
  }
}

// Crear directorio de logs si no existe
const logDir = join("logs", "pino");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const levelConfigs: Record<string, { size: string; limit: number }> = {
  debug: { size: "5m", limit: 50 },
  info: { size: "10m", limit: 100 },
  warn: { size: "15m", limit: 200 },
  error: { size: "20m", limit: 300 },
};

const levelTransports = Object.entries(levelConfigs).map(([level, config]) => ({
  level,
  stream: pino.transport({
    target: "pino-roll",
    options: {
      file: join(logDir, level),
      frequency: "hourly",
      mkdir: true,
      size: config.size,
      limit: { count: config.limit },
      dateFormat: "yyyyMMdd_HH",
      extension: ".log",
    },
  }),
}));

if (process.env.NODE_ENV !== "production") {
  levelTransports.push({
    level: "debug",
    stream: pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-MM-dd HH:MM:ss.l o",
        ignore: "pid,hostname",
      },
    }),
  });
}

const loggerInstance = pino(
  {
    base: null,
    level: "debug",
  },
  pino.multistream(levelTransports)
);

function enrichLogData(location: string, extra: LogData = {}): LogData {
  const base: LogData = {
    location,
    userId: getUserId(),
    env: process.env.NODE_ENV,
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
function logMethod(level: "info" | "warn" | "error" | "debug") {
  return (location: string, msgOrError: string | Error, maybeData?: LogData | Error) => {
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
      } else if (typeof maybeData === "object" && maybeData !== null) {
        logData = { data: maybeData };
      }
    }

    loggerInstance[level](enrichLogData(location, logData), message);
  };
}

export const log = {
  info: logMethod("info"),
  warn: logMethod("warn"),
  error: logMethod("error"),
  debug: logMethod("debug"),
};
