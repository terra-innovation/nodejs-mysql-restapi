import { beforeEach, expect, it, vi } from "vitest";
import express from "express";
import type { ErrorRequestHandler } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
const b = vi.hoisted(() => ({ listar: vi.fn(), detalle: vi.fn(), sugerencias: vi.fn(), crear: vi.fn(), mutar: vi.fn(), master: vi.fn(), accesos: vi.fn() }));
vi.mock("#src/services/admin/saldocontable.Service.js", () => ({ listarPeriodosService: b.listar, detallePeriodoService: b.detalle, sugerenciasService: b.sugerencias, crearPeriodoService: b.crear, mutarPeriodoService: b.mutar, getCatalogosService: b.master }));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "saldo-test-only" } }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.accesos }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: {} } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), warn: vi.fn() } }));
import router from "#src/routes/admin/splaft/saldocontable.routes.js";
import { generarMenuAdmin } from "#src/menu/menuAdmin.js";
const app = express();
app.use(express.json());
app.use("/api/v1", router);
const handler: ErrorRequestHandler = (e, _req, res, _next) => {
  res.status(e instanceof ZodError ? 400 : e.statusCode || 500).json({ error: true });
};
app.use(handler);
const base = "/api/v1/admin/splaft/saldocontable",
  id = "00000000-0000-4000-8000-000000000001";
const token = (role = 2) => `Bearer ${jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "saldo-test-only")}`;
const body = { nombre_periodo: "Segundo trimestre 2026", fecha_inicio: "2026-04-01", fecha_fin: "2026-06-30", fecha_corte: "2026-06-30", tipo_operacion: "DESCUENTO" };
beforeEach(() => {
  vi.clearAllMocks();
  b.accesos.mockResolvedValue({ usuario_roles: [{ idrol: 2 }] });
  b.crear.mockResolvedValue({});
  b.mutar.mockResolvedValue({});
  b.listar.mockResolvedValue({ items: [], total: 0 });
});
it("creación utiliza únicamente el usuario autenticado", async () => {
  await request(app).post(base).set("Authorization", token()).send(body).expect(201);
  expect(b.crear).toHaveBeenCalledWith(body, 42);
});
it.each(["monto_saldo_contable", "idusuariocrea", "estado", "idsbssaldocontableperiodoestado"])("no permite imponer %s al crear", async (campo) => {
  await request(app)
    .post(base)
    .set("Authorization", token())
    .send({ ...body, [campo]: 1 })
    .expect(400);
  expect(b.crear).not.toHaveBeenCalled();
});
it("rechaza Factoring, ID incorrecto, listas duplicadas, versión ausente e importes del cliente", async () => {
  await request(app)
    .post(base)
    .set("Authorization", token())
    .send({ ...body, tipo_operacion: "FACTORING" })
    .expect(400);
  for (const payload of [{ accion: "cerrar" }, { accion: "asociar", version: 1, operaciones: [id, id] }, { accion: "asociar", version: 1, operaciones: [id], tipo_cambio: 3 }]) await request(app).patch(`${base}/${id}`).set("Authorization", token()).send(payload).expect(400);
  await request(app).get(`${base}/invalid`).set("Authorization", token()).expect(400);
  expect(b.mutar).not.toHaveBeenCalled();
});
it.each(["listar", "master", id, `${id}/sugerencias`])("protege GET %s ante ausencia de sesión y revocación", async (path) => {
  await request(app).get(`${base}/${path}`).expect(403);
  await request(app).get(`${base}/${path}`).set("Authorization", token(6)).expect(403);
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).get(`${base}/${path}`).set("Authorization", token()).expect(403);
});
it("protege escrituras de roles ajenos e inválidos", async () => {
  await request(app).post(base).set("Authorization", token(3)).send(body).expect(403);
  await request(app).patch(`${base}/${id}`).set("Authorization", "Bearer invalid").send({ accion: "cerrar", version: 1 }).expect(401);
  expect(b.crear).not.toHaveBeenCalled();
  expect(b.mutar).not.toHaveBeenCalled();
});
it("propaga conflictos y aplica paginación acotada", async () => {
  b.mutar.mockRejectedValue({ statusCode: 409 });
  await request(app).patch(`${base}/${id}`).set("Authorization", token()).send({ accion: "cerrar", version: 1 }).expect(409);
  await request(app).get(`${base}/listar`).set("Authorization", token()).expect(200);
  expect(b.listar).toHaveBeenCalledWith(1, 25);
  await request(app).get(`${base}/listar?limit=101`).set("Authorization", token()).expect(400);
});
it("menú agrega Saldo Contable inmediatamente después de Registro de operaciones", () => {
  type Node = { title?: string; children?: Node[] };
  const menu = generarMenuAdmin({ ispersonavalidated: true } as Parameters<typeof generarMenuAdmin>[0]) as Node[];
  const opciones = menu.flatMap((g) => g.children ?? []).find((g) => g.title === "SPLAFT")!.children!;
  expect(opciones.map((g) => g.title)).toEqual(["Registro de operaciones", "Saldo Contable"]);
});
