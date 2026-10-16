import { beforeEach, expect, it, vi } from "vitest";
import express from "express";
import type { ErrorRequestHandler } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
const b = vi.hoisted(() => ({ accesos: vi.fn(), call: vi.fn() }));
vi.mock("#src/services/banca/transaccionbancaria.Service.js", () => Object.fromEntries(["consultarOrigen", "listarConexiones", "guardarConexion", "estadoConexion", "validarConexion", "masterBanco", "listarMapeos", "crearMapeo", "estadoMapeo", "listarMovimientos", "detalleMovimiento", "crearMovimiento", "mutarMovimiento", "sincronizar", "listarLogs", "resolverIncidencia"].map((name) => [name, b.call])));
vi.mock("#src/services/admin/configuracionbbdd.Service.js", () => Object.fromEntries(["listarConexiones", "guardarConexion", "estadoConexion", "validarConexion"].map((name) => [name, b.call])));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "banco-test-only" } }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.accesos }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: {} } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), warn: vi.fn() } }));
import admin from "#src/routes/admin/configuracionbbdd.routes.js";
import financiero from "#src/routes/financiero/transaccionbancaria.routes.js";
import { generarMenuAdmin } from "#src/menu/menuAdmin.js";
import { generarMenuFinanciero } from "#src/menu/menuFinanciero.js";
const app = express();
app.use(express.json());
app.use("/api/v1", admin, financiero);
const handler: ErrorRequestHandler = (e, _req, res, _next) => {
  res.status(e instanceof ZodError ? 400 : e.statusCode || 500).json({ error: true, message: e.message });
};
app.use(handler);
const base = "/api/v1/financiero/transaccionbancaria",
  config = "/api/v1/admin/configuracionbbdd",
  uuid = "00000000-0000-4000-8000-000000000001";
const token = (role: number) => `Bearer ${jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "banco-test-only")}`;
it("origen exige financiero y rango válido antes de consultar", async () => {
  await request(app).get(`${base}/origen`).set("Authorization", token(2)).expect(403);
  await request(app).get(`${base}/origen?conexion=${uuid}`).set("Authorization", token(6)).expect(400);
  await request(app).get(`${base}/origen?conexion=${uuid}&desde=2026-02-30&hasta=2026-03-01`).set("Authorization", token(6)).expect(400);
  await request(app).get(`${base}/origen?conexion=${uuid}&desde=2026-03-02&hasta=2026-03-01`).set("Authorization", token(6)).expect(400);
  await request(app).get(`${base}/origen?conexion=${uuid}&desde=2026-01-01&hasta=2026-01-31&page=2&limit=10&search=0001&sortBy=monto&desc=false`).set("Authorization", token(6)).expect(200);
  expect(b.call).toHaveBeenLastCalledWith({ conexion: uuid, desde: "2026-01-01", hasta: "2026-01-31", page: 2, limit: 10, search: "0001", sortBy: "monto", desc: false });
});
beforeEach(() => {
  vi.clearAllMocks();
  b.accesos.mockResolvedValue({ usuario_roles: [{ idrol: 2 }, { idrol: 6 }] });
  b.call.mockResolvedValue({});
});
it.each(["master", "movimientos", "cuentas", "ejecuciones", "incidencias", "historial"])("GET %s es exclusivo de financiero y verifica rol vigente", async (path) => {
  await request(app).get(`${base}/${path}`).expect(403);
  await request(app).get(`${base}/${path}`).set("Authorization", token(2)).expect(403);
  await request(app).get(`${base}/${path}`).set("Authorization", token(6)).expect(200);
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).get(`${base}/${path}`).set("Authorization", token(6)).expect(403);
});
it("configuración es exclusiva del administrador, no del financiero", async () => {
  await request(app).get(`${config}/listar`).set("Authorization", token(6)).expect(403);
  await request(app).get(`${config}/listar`).set("Authorization", token(2)).expect(200);
});
it("probar borrador es exclusivo del administrador y pasa UUID y valores actuales al diagnóstico", async () => {
  const body = { configuracionbbddid: uuid, conexion: { host: "nuevo.example.test", base_datos: "manual" } };
  await request(app).post(`${config}/probar`).send(body).expect(403);
  await request(app).post(`${config}/probar`).set("Authorization", token(6)).send(body).expect(403);
  await request(app).post(`${config}/probar`).set("Authorization", token(2)).send(body).expect(200);
  expect(b.call).toHaveBeenLastCalledWith(uuid, body.conexion);
});
it("sincronización usa actor autenticado y valida límites/fechas", async () => {
  const payload = { conexion: uuid, desde: null, hasta: null, historico: false };
  await request(app).post(`${base}/sincronizar`).set("Authorization", token(6)).send(payload).expect(200);
  expect(b.call).toHaveBeenLastCalledWith(payload, 42);
  for (const bad of [
    { ...payload, idusuariocrea: 1 },
    { ...payload, desde: "2026-02-30", hasta: "2026-03-01" },
    { ...payload, cuentas: [uuid, uuid] },
  ])
    await request(app).post(`${base}/sincronizar`).set("Authorization", token(6)).send(bad).expect(400);
  await request(app).post(`${base}/sincronizar`).set("Authorization", token(2)).send(payload).expect(403);
});
it("rechaza imponer identidad, estado, moneda o actor al crear", async () => {
  const payload = { cuenta: uuid, fecha: "2026-10-15", numero_operacion: "0001", descripcion: "Sintética", signo: -1, monto: "12.50" };
  for (const field of ["identidad_sha256", "idmoneda", "idusuariocrea", "estado"])
    await request(app)
      .post(`${base}/movimientos`)
      .set("Authorization", token(6))
      .send({ ...payload, [field]: "impuesto" })
      .expect(400);
  await request(app)
    .post(`${base}/movimientos`)
    .set("Authorization", token(6))
    .send({ ...payload, monto: "-12.50" })
    .expect(400);
  await request(app).post(`${base}/movimientos`).set("Authorization", token(6)).send(payload).expect(201);
  expect(b.call).toHaveBeenLastCalledWith(payload, 42);
});
it("errores del driver no filtran SQL, secretos ni datos", async () => {
  b.call.mockRejectedValue(new Error("password=secreto; SELECT datos_cliente"));
  const result = await request(app).get(`${base}/movimientos`).set("Authorization", token(6)).expect(500);
  expect(JSON.stringify(result.body)).not.toMatch(/secreto|datos_cliente/);
});
it("menú coloca configuración debajo de correo y gestión solamente en financiero", () => {
  type Node = { type?: string; title?: string; url?: string; children?: Node[] };
  const flatten = (nodes: Node[]): Node[] => nodes.flatMap((n) => [n, ...flatten(n.children || [])]);
  const profile = { ispersonavalidated: true } as Parameters<typeof generarMenuAdmin>[0];
  const a = flatten(generarMenuAdmin(profile) as Node[]),
    f = flatten(generarMenuFinanciero(profile) as Node[]);
  expect(a[a.findIndex((n) => n.title === "Config Correo") + 1].title).toBe("Config BBDD");
  expect(a.some((n) => n.url?.startsWith("/financiero/transaccionbancaria"))).toBe(false);
  const bankMenu = f.find((n) => n.title === "Sincronización de transacciones bancarias")?.children;
  expect(bankMenu).toHaveLength(7);
  expect(bankMenu?.some((n) => n.url === "/financiero/transaccionbancaria/origen")).toBe(true);
  expect(f.find((n) => n.title === "Sincronización de transacciones bancarias")?.type).toBe("collapse");
  expect(generarMenuFinanciero(profile).every((n) => n.type === "group")).toBe(true);
});
it("filtra movimientos por varias cuentas y rango antes de paginar", async () => {
  const other = "00000000-0000-4000-8000-000000000002";
  await request(app)
    .get(`${base}/movimientos`)
    .query({ cuentas: `${uuid},${other}`, desde: "2026-08-18", hasta: "2026-10-16", page: 2, limit: 10 })
    .set("Authorization", token(6))
    .expect(200);
  expect(b.call).toHaveBeenLastCalledWith({ cuentas: [uuid, other], desde: "2026-08-18", hasta: "2026-10-16", page: 2, limit: 10, search: "" });
  for (const query of [{ cuentas: `${uuid},${uuid}` }, { cuentas: "invalid" }, { desde: "2026-10-17", hasta: "2026-10-16" }]) await request(app).get(`${base}/movimientos`).query(query).set("Authorization", token(6)).expect(400);
});
