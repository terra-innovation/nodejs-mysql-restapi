import pino from "pino";
import { join } from "path";
import fs from "fs";

type LogData = Record<string, unknown>;

function line(): string {
  const stack = new Error().stack?.split("\n") || [];
  const callerLine = stack.find((line, index) => index > 1 && line.includes("at")) || "";
  const match = callerLine.trim().match(/^at (.+?) \((.+):(\d+):(\d+)\)$/) || callerLine.trim().match(/^at (.+):(\d+):(\d+)$/);

  if (match) {
    if (match.length === 5) {
      const [, fn, file, line, col] = match;
      return `${fn} (${file}:${line}:${col})`;
    } else if (match.length === 4) {
      const [, file, line, col] = match;
      return `(anonymous) (${file}:${line}:${col})`;
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

// Configuración personalizada por nivel
const levelConfigs: Record<string, { size: string; limit: number }> = {
  debug: { size: "5m", limit: 50 },
  info: { size: "10m", limit: 100 },
  warn: { size: "15m", limit: 200 },
  error: { size: "20m", limit: 300 },
};

// Crear transportes por nivel con su configuración
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

// Agregar salida legible en consola en desarrollo
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

// Crear instancia del logger
const loggerInstance = pino(
  {
    base: null,
    level: "debug",
  },
  pino.multistream(levelTransports)
);

// Enriquecer datos
function enrichLogData(data: LogData = {}, msg?: string): LogData {
  return {
    ...data,
    location: line(),
    userId: getUserId(),
    env: process.env.NODE_ENV,
  };
}

// Métodos por nivel
function logMethod(level: "info" | "warn" | "error" | "debug") {
  return (msgOrData: string | LogData, maybeData?: LogData) => {
    const msg = typeof msgOrData === "string" ? msgOrData : "Log message";
    const data = typeof msgOrData === "string" ? maybeData : msgOrData;
    loggerInstance[level](enrichLogData(data, msg), msg);
  };
}

const logger = {
  info: logMethod("info"),
  warn: logMethod("warn"),
  error: logMethod("error"),
  debug: logMethod("debug"),
};

export default logger;
