import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";
import { readFileSync } from "node:fs";

/** Convierte las opciones de la URL Prisma (segundos) a las del driver MariaDB. */
export function createMariaDbAdapter(connectionString: string): PrismaMariaDb {
  const url = new URL(connectionString);
  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error("La conexión Prisma requiere una URL MySQL/MariaDB.");
  }

  const supported = new Set(["connection_limit", "connect_timeout", "pool_timeout", "socket_timeout", "timezone", "socket", "sslcert", "sslidentity", "sslpassword", "sslaccept"]);
  for (const key of url.searchParams.keys()) {
    if (!supported.has(key)) throw new Error(`Opción de conexión Prisma no soportada por el adaptador: ${key}`);
  }

  const numberOption = (key: string, fallback: number, multiplier = 1): number => {
    const raw = url.searchParams.get(key);
    const value = raw === null ? fallback : Number(raw);
    if (!Number.isFinite(value) || value < 0 || (key === "connection_limit" && (!Number.isInteger(value) || value < 1))) {
      throw new Error(`Opción numérica de conexión Prisma inválida: ${key}`);
    }
    return value * multiplier;
  };

  const options: PoolConfig = {
    host: url.hostname.replace(/^\[|\]$/g, ""),
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: numberOption("connection_limit", 10),
    connectTimeout: numberOption("connect_timeout", 5, 1000),
    acquireTimeout: numberOption("pool_timeout", 10, 1000),
    socketTimeout: numberOption("socket_timeout", 0, 1000),
    timezone: url.searchParams.get("timezone") || "+00:00",
    // Prisma trabaja con fechas UTC; conservar también la zona de la sesión SQL.
    initSql: "SET time_zone = '+00:00'",
  };

  if (url.searchParams.has("socket")) options.socketPath = url.searchParams.get("socket");
  const sslcert = url.searchParams.get("sslcert");
  const sslidentity = url.searchParams.get("sslidentity");
  const sslaccept = url.searchParams.get("sslaccept");
  if (sslaccept && !["strict", "accept_invalid_certs"].includes(sslaccept)) {
    throw new Error("La opción sslaccept debe ser strict o accept_invalid_certs.");
  }
  if (sslcert || sslidentity || sslaccept) {
    options.ssl = {
      rejectUnauthorized: sslaccept !== "accept_invalid_certs",
      ...(sslcert ? { ca: readFileSync(sslcert) } : {}),
      ...(sslidentity ? { pfx: readFileSync(sslidentity), passphrase: url.searchParams.get("sslpassword") || undefined } : {}),
    };
  }

  return new PrismaMariaDb(options);
}
