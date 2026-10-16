import { expect, it } from "vitest";
import { mariaDbOptions } from "#src/models/prisma/mariadbAdapter.js";
it("opciones compartidas por Prisma y bloqueo conservan zona, límites y TLS", () => {
  const options = mariaDbOptions("mysql://sintetico:clave-sintetica@localhost:3306/pruebas?connection_limit=3&connect_timeout=8&pool_timeout=10&socket_timeout=30&sslaccept=strict");
  expect(options).toMatchObject({ connectionLimit: 3, connectTimeout: 8000, acquireTimeout: 10000, socketTimeout: 30000, timezone: "+00:00", initSql: "SET time_zone = '+00:00'", ssl: { rejectUnauthorized: true } });
});
it("rechaza protocolos y opciones desconocidas en lugar de ignorar seguridad", () => {
  expect(() => mariaDbOptions("https://localhost/pruebas")).toThrow();
  expect(() => mariaDbOptions("mysql://localhost/pruebas?insecure=yes")).toThrow("no soportada");
});
