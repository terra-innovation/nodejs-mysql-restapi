import { afterEach, beforeEach, expect, it, vi } from "vitest";
import express from "express";
import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import * as xlsx from "xlsx";

const b = vi.hoisted(() => ({ query: vi.fn(), accesos: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "consolidado-test-only" } }));
vi.mock("#src/utils/logger.pino.js", () => ({ log: { warn: vi.fn(), debug: vi.fn() }, line: () => "test" }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.accesos }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $queryRaw: b.query } } }));
vi.mock("#src/services/financiero/factoring.Service.js", () => ({
  getFactoringMasterService: vi.fn(),
  getFactoringsPendientesFacturaCedenteService: vi.fn(),
  getFactoringsService: vi.fn(),
  getFactoringEmpresaDetalleService: vi.fn(),
  getPreFacturaCedenteService: vi.fn(),
}));
import router from "#src/routes/financiero/servicio/factoring/factoring.routes.js";
const app = express();
app.use("/api/v1", router);
const handler: ErrorRequestHandler = (_err, _req, res, _next) => {
  res.status(500).json({ error: true });
};
app.use(handler);
const path = "/api/v1/financiero/servicio/factoring/factoring/consolidado.xlsx";
const token = (role = 6) => `Bearer ${jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "consolidado-test-only")}`;
beforeEach(() => {
  vi.clearAllMocks();
  b.query.mockResolvedValue([{ c0: "IT-1", c1: "2026-10-14", c11: 1180 }]);
  b.accesos.mockResolvedValue({ usuario_roles: [{ idrol: 6 }] });
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-15T04:11:00Z"));
});
afterEach(() => vi.useRealTimers());
it("descarga un XLSX real desde ruta/controlador/servicio/DAO con nombre Lima", async () => {
  const response = await request(app)
    .get(path)
    .set("Authorization", token())
    .buffer(true)
    .parse((res, done) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => done(null, Buffer.concat(chunks)));
    })
    .expect(200);
  expect(response.headers["content-type"]).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  expect(response.headers["content-disposition"]).toContain("Consolidado de Operaciones de Factoring (20261014_2311).xlsx");
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(b.query).toHaveBeenCalledOnce();
  const sheet = xlsx.read(response.body as Buffer).Sheets.Hoja1;
  expect(sheet.A2.v).toBe("IT-1");
});
it("rechaza sin sesión antes de consultar el reporte", async () => {
  await request(app).get(path).expect(403);
  expect(b.query).not.toHaveBeenCalled();
});
it.each([2, 3, 4, 5])("rechaza rol %s antes de consultar el reporte", async (role) => {
  await request(app).get(path).set("Authorization", token(role)).expect(403);
  expect(b.query).not.toHaveBeenCalled();
});
it("rechaza un rol financiero revocado", async () => {
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).get(path).set("Authorization", token()).expect(403);
  expect(b.query).not.toHaveBeenCalled();
});
it("propaga un fallo SQL sin entregar un archivo exitoso", async () => {
  b.query.mockRejectedValue(new Error("SQL"));
  const response = await request(app).get(path).set("Authorization", token()).expect(500);
  expect(response.headers["content-disposition"]).toBeUndefined();
});
