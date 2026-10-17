import { beforeEach, expect, it, vi } from "vitest";
import express from "express";
import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { ZodError } from "zod";
const b = vi.hoisted(() => ({ actualizar: vi.fn(), listar: vi.fn(), detalle: vi.fn(), master: vi.fn(), accesos: vi.fn() }));
vi.mock("#src/services/financiero/factoringdetraccion.Service.js", () => ({ actualizarDetraccionService: b.actualizar, listarDetraccionesService: b.listar, getDetraccionService: b.detalle, getDetraccionMasterService: b.master }));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "detraccion-test-only" } }));
vi.mock("#src/utils/logger.pino.js", () => ({ log: { warn: vi.fn(), debug: vi.fn() }, line: () => "test" }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.accesos }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: {} } }));
import router from "#src/routes/financiero/servicio/factoring/factoringdetraccion.routes.js";
import { generarMenuFinanciero } from "#src/menu/menuFinanciero.js";
const base = "/api/v1/financiero/servicio/factoring/factoringdetraccion";
const id = "00000000-0000-4000-8000-000000000001";
const app = express();
app.use(express.json());
app.use("/api/v1", router);
const handler: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(err instanceof ZodError ? 400 : err.statusCode || 500).json({ error: true });
};
app.use(handler);
const token = (role = 6) => `Bearer ${jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "detraccion-test-only")}`;
const body = () => ({ detraccionestadoid: id, fecha_pago_detraccion: "2026-10-14T05:00:00.000Z", version: "2026-10-14T04:00:00.000Z" });
beforeEach(() => {
  vi.clearAllMocks();
  b.accesos.mockResolvedValue({ usuario_roles: [{ idrol: 6 }] });
  b.actualizar.mockResolvedValue({ version: "new" });
  b.listar.mockResolvedValue({ registros: [], total: 0 });
});
it("autoriza router real y usa ID de URL y usuario de sesión", async () => {
  await request(app).patch(`${base}/actualizar/${id}`).set("Authorization", token()).send(body()).expect(200);
  expect(b.actualizar).toHaveBeenCalledWith({ ...body(), id, idusuario: 42 });
});
it.each(["facturaestadoid", "fecha_pago_factura", "factoringid", "idusuario", "factoringfacturafactorid", "importe_bruto"])("rechaza campo extra %s", async (campo) => {
  await request(app)
    .patch(`${base}/actualizar/${id}`)
    .set("Authorization", token())
    .send({ ...body(), [campo]: id })
    .expect(400);
  expect(b.actualizar).not.toHaveBeenCalled();
});
it.each([null, "2026-02-30T05:00:00.000Z", "2026-10-14", "2026-10-14T05:00:00-05:00"])("valida versión/formato temporal %s", async (fecha) => {
  const data = fecha === null ? { ...body(), version: undefined } : { ...body(), fecha_pago_detraccion: fecha };
  await request(app).patch(`${base}/actualizar/${id}`).set("Authorization", token()).send(data).expect(400);
});
it("rechaza ID inválido, estado de listado ajeno y tamaño excesivo", async () => {
  await request(app).get(`${base}/detalle/invalid`).set("Authorization", token()).expect(400);
  await request(app).get(`${base}/listar?estado=NO%20APLICA`).set("Authorization", token()).expect(400);
  await request(app).get(`${base}/listar?tamanio=101`).set("Authorization", token()).expect(400);
});
it.each(["listar", "master", `detalle/${id}`])("protege GET %s sin sesión y con rol ajeno/revocado", async (recurso) => {
  await request(app).get(`${base}/${recurso}`).expect(403);
  await request(app).get(`${base}/${recurso}`).set("Authorization", token(3)).expect(403);
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).get(`${base}/${recurso}`).set("Authorization", token()).expect(403);
});
it("protege PATCH con token inválido y rol revocado", async () => {
  await request(app).patch(`${base}/actualizar/${id}`).set("Authorization", "Bearer invalid").send(body()).expect(401);
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).patch(`${base}/actualizar/${id}`).set("Authorization", token()).send(body()).expect(403);
  expect(b.actualizar).not.toHaveBeenCalled();
});
it("propaga conflicto 409 y aplica valores de paginación predeterminados", async () => {
  b.actualizar.mockRejectedValue({ statusCode: 409 });
  await request(app).patch(`${base}/actualizar/${id}`).set("Authorization", token()).send(body()).expect(409);
  await request(app).get(`${base}/listar`).set("Authorization", token()).expect(200);
  expect(b.listar).toHaveBeenCalledWith({ estado: "PENDIENTE", pagina: 1, tamanio: 10, busqueda: "", ordenarPor: "fechaEmision", direccion: "desc" });
});
it("menú conserva condiciones y coloca detracción entre pendientes factura y Operaciones", () => {
  expect(generarMenuFinanciero({ ispersonavalidated: false } as Parameters<typeof generarMenuFinanciero>[0])).toEqual([]);
  const menu = generarMenuFinanciero({ ispersonavalidated: true } as Parameters<typeof generarMenuFinanciero>[0]);
  type MenuNode = { title?: string; url?: string; children?: MenuNode[] };
  const opciones = (menu as MenuNode[]).flatMap((group) => group.children || []).flatMap((item) => item.children || []);
  expect(opciones.map((item) => item.title)).toEqual(["Pendientes de facturar al cedente", "Pendientes de pago de detracción", "Operaciones", "Datos del origen remoto", "Transacciones bancarias", "Cuentas de origen", "Sincronizar manualmente", "Ejecuciones y log", "Incidencias", "Historial de cambios"]);
  expect(opciones[1].url).toContain("pendientes-detraccion");
});
