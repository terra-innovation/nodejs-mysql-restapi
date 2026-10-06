import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "test-only-access-key" }, isProduction: true }));
jest.mock("#src/utils/logger.pino.js", () => ({ log: { debug: jest.fn(), warn: jest.fn(), error: jest.fn() }, line: jest.fn() }));
jest.mock("#src/models/prisma/db-factoring.js", () => {
  const client = { usuario: { findFirst: jest.fn() }, usuario_servicio: { findFirst: jest.fn() }, $transaction: null };
  client.$transaction = jest.fn(async (callback) => callback(client));
  return { prismaFT: { client, transactionTimeout: 5000 } };
});

import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { actualizarAccesosService } from "#src/services/secure/accesos.Service.js";
import { getEstadoSuscripcionService } from "#src/services/usuario/usuarioservicioestadoConsulta.Service.js";
import { actualizarAccesos } from "#src/controllers/secure/accesos.Controller.js";
import { getEstadoSuscripcion } from "#src/controllers/usuario/usuarioservicioestadoConsulta.Controller.js";
import { isAuth, isRole } from "#src/middlewares/authMiddleware.js";
import { rateLimiterAccesosMiddleware } from "#src/middlewares/ratelimiterMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";

const key = "test-only-access-key";
const usuarioid = "3b39a694-5e67-4fde-a0ef-799f16801536";
const subscriptionId = "59b8c123-6d27-438b-bd29-aa8d90a1eb4c";
const role = (idrol: number) => ({ idrol, estado: 1, rol: { estado: 1, code: `role-${idrol}` } });
const usuario = { idusuario: 42, usuarioid, estado: 1, ispersonavalidated: true, usuario_roles: [role(5), role(3)], hash: "private" };
const client = prismaFT.client as any;
const session = () => ({ usuario: { ...usuario, usuario_roles: [role(5)] } as any, iat: Math.floor(Date.now() / 1000) - 100, exp: Math.floor(Date.now() / 1000) + 600 });
const app = express();
app.use(express.json());
app.post("/access", isAuth, rateLimiterAccesosMiddleware, catchedAsync(actualizarAccesos));
app.get("/state/:id", isAuth, catchedAsync(getEstadoSuscripcion));
app.get("/protected", isAuth, isRole([3]), (_req, res) => { res.json({ ok: true }); });
app.use((error, _req, res, _next) => { res.status(error.statusCode || 400).json({ error: true, message: error.message }); });

beforeEach(() => {
  jest.clearAllMocks();
  client.usuario.findFirst.mockResolvedValue(usuario);
  client.usuario_servicio.findFirst.mockResolvedValue({ usuarioservicioid: subscriptionId, idservicio: 1,
    idusuarioservicioestado: 2, usuario_servicio_estado: { code: "approved", alias: "SUSCRITO", color: "success" } });
});

test("actualiza roles y menú conservando exp e iat y excluye datos privados", async () => {
  const source = session();
  const result = await actualizarAccesosService(source);
  const decoded = jwt.verify(result.token, key) as any;
  expect(decoded.exp).toBe(source.exp);
  expect(decoded.iat).toBe(source.iat);
  expect(decoded.usuario.usuario_roles.map((item) => item.idrol)).toEqual([5, 3]);
  expect(decoded.usuario.hash).toBeUndefined();
  expect(result.usuario.idusuario).toBeUndefined();
  expect(result.usuario.hash).toBeUndefined();
  expect(result.menu.items.some((item) => item.id === "empresario-group-factoring-electronico")).toBe(true);
  expect(client.usuario.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: { idusuario: 42, estado: 1 },
    include: { usuario_roles: { where: { estado: 1, rol: { estado: 1 } }, include: { rol: true } } },
  }));
});

test.each([3, 4])("el token nuevo habilita el menú del rol %s", async (idrol) => {
  client.usuario.findFirst.mockResolvedValue({ ...usuario, usuario_roles: [role(5), role(idrol)] });
  const result = await actualizarAccesosService(session());
  const route = idrol === 3 ? "/empresario/factoring/nuevo" : "/inversionista/factoring/oportunidades";
  expect(result.menu.items.some((item) => item.children?.some((child) => child.url === route))).toBe(true);
});

test("rechaza una sesión vencida sin consultar la base de datos", async () => {
  await expect(actualizarAccesosService({ ...session(), exp: 1 })).rejects.toMatchObject({ statusCode: 401 });
  expect(client.usuario.findFirst).not.toHaveBeenCalled();
});

test("rechaza una cuenta inexistente o inactiva", async () => {
  client.usuario.findFirst.mockResolvedValue(null);
  await expect(actualizarAccesosService(session())).rejects.toMatchObject({ statusCode: 401 });
});

test("la consulta de estado filtra por propietario y utiliza solo los datos necesarios", async () => {
  const result = await getEstadoSuscripcionService(42, subscriptionId);
  expect(result).toMatchObject({ suscrito: true, acceso: { idrol: 3, url: "/empresario/factoring/nuevo" } });
  expect(client.usuario_servicio.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: { usuarioservicioid: subscriptionId, idusuario: 42, estado: 1, usuario: { estado: 1 } },
  }));
  client.usuario_servicio.findFirst.mockResolvedValue(null);
  await expect(getEstadoSuscripcionService(99, subscriptionId)).rejects.toMatchObject({ statusCode: 404 });
});

test("suscripción pendiente y servicio no integrado no conceden accesos", async () => {
  client.usuario_servicio.findFirst.mockResolvedValue({ usuarioservicioid: subscriptionId, idservicio: 99,
    idusuarioservicioestado: 3, usuario_servicio_estado: { alias: "EN REVISIÓN" } });
  expect(await getEstadoSuscripcionService(42, subscriptionId)).toMatchObject({ suscrito: false, acceso: null });
});

test("HTTP: solo el token actualizado permite usar la API protegida; ignora roles e identidad del cuerpo", async () => {
  const sourceToken = jwt.sign(session(), key);
  await request(app).get("/protected").set("Authorization", `Bearer ${sourceToken}`).expect(403);
  const result = await request(app).post("/access").set("Authorization", `Bearer ${sourceToken}`)
    .send({ idusuario: 99, roles: [2] }).expect(200);
  expect(result.headers["cache-control"]).toBe("no-store");
  expect(result.body.data.usuarioid).toBe(usuarioid);
  await request(app).get("/protected").set("Authorization", `Bearer ${result.body.data.token}`).expect(200);
  await request(app).post("/access").set("Authorization", "Bearer invalid").expect(401);
  await request(app).get(`/state/${subscriptionId}`).set("Authorization", `Bearer ${sourceToken}`).expect(200);
  await request(app).get("/state/invalid").set("Authorization", `Bearer ${sourceToken}`).expect(400);
});

test("HTTP: límite por usuario y Retry-After; otro usuario conserva su cupo", async () => {
  const token = jwt.sign({ ...session(), usuario: { ...usuario, idusuario: 900 } }, key);
  for (let count = 0; count < 10; count += 1) {
    await request(app).post("/access").set("Authorization", `Bearer ${token}`).expect(200);
  }
  const blocked = await request(app).post("/access").set("Authorization", `Bearer ${token}`).expect(429);
  expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
  const other = jwt.sign({ ...session(), usuario: { ...usuario, idusuario: 901 } }, key);
  await request(app).post("/access").set("Authorization", `Bearer ${other}`).expect(200);
});
