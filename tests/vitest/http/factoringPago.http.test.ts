import { beforeEach, expect, it, vi } from "vitest";
import express from "express";
import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { ZodError } from "zod";
const b = vi.hoisted(() => ({ consulta: vi.fn(), buscar: vi.fn(), estado: vi.fn(), detalle: vi.fn(), accesos: vi.fn() }));
vi.mock("#src/services/admin/factoringpago.Service.js", () => ({ consultarPago: b.consulta, buscarTransaccionesPago: b.buscar, cambiarEstadoPago: b.estado, guardarDetallePago: b.detalle }));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "pagos-test-only" } }));
vi.mock("#src/utils/logger.pino.js", () => ({ log: { warn: vi.fn(), debug: vi.fn() }, line: () => "test" }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.accesos }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: {} } }));
import router from "#src/routes/admin/servicio/factoring/factoringpago.routes.js";
const id = "00000000-0000-4000-8000-000000000001",
  base = `/api/v1/admin/servicio/factoring/factoringpago/${id}`;
const app = express();
app.use(express.json());
app.use("/api/v1", router);
const handler: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(err instanceof ZodError ? 400 : err.statusCode || 500).json({ error: true });
};
app.use(handler);
const token = (role = 2) => `Bearer ${jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "pagos-test-only")}`;
beforeEach(() => {
  vi.clearAllMocks();
  b.accesos.mockResolvedValue({ usuario_roles: [{ idrol: 2 }, { idrol: 6 }] });
  b.consulta.mockResolvedValue({ maestro: null });
  b.detalle.mockResolvedValue({});
  b.buscar.mockResolvedValue({ items: [], total: 0 });
  b.estado.mockResolvedValue({});
});
it("consulta y mutación son exclusivas del administrador con rol vigente", async () => {
  await request(app).get(base).expect(403);
  await request(app).get(base).set("Authorization", token(6)).expect(403);
  await request(app).get(base).set("Authorization", token()).expect(200);
  b.accesos.mockResolvedValue({ usuario_roles: [] });
  await request(app).get(base).set("Authorization", token()).expect(403);
});
it("el alta usa el actor de sesión, valida importes y no admite campos de maestro", async () => {
  const body = { accion: "crear", transaccion: id, monto: "100.50", version: 1 };
  await request(app)
    .post(base + "/detalles")
    .set("Authorization", token())
    .send(body)
    .expect(200);
  expect(b.detalle).toHaveBeenCalledWith(id, { ...body, motivo: "" }, 42);
  await request(app)
    .post(base + "/detalles")
    .set("Authorization", token())
    .send({ ...body, idusuario: 105 })
    .expect(400);
  await request(app)
    .post(base + "/detalles")
    .set("Authorization", token())
    .send({ ...body, monto_total_pagado: "100.50" })
    .expect(400);
});
it("el cambio de estado manual es una acción específica y exige versión", async () => {
  await request(app)
    .patch(base + "/estado")
    .set("Authorization", token())
    .send({ estado: id, version: 2, motivo: "Cierre manual" })
    .expect(200);
  expect(b.estado).toHaveBeenCalledWith(id, id, 2, "Cierre manual", 42);
  await request(app)
    .patch(base + "/estado")
    .set("Authorization", token())
    .send({ estado: id, motivo: "Cierre" })
    .expect(400);
  await request(app).patch(base).set("Authorization", token()).send({}).expect(404);
});
it("el buscador requiere fechas civiles válidas y pagina sin aceptar límites excesivos", async () => {
  await request(app)
    .get(base + "/transacciones")
    .set("Authorization", token())
    .expect(400);
  await request(app)
    .get(base + "/transacciones?desde=2026-02-30&hasta=2026-10-16")
    .set("Authorization", token())
    .expect(422);
  await request(app)
    .get(base + "/transacciones?desde=2026-10-01&hasta=2026-10-16&pagina=2&limite=10&q=001")
    .set("Authorization", token())
    .expect(200);
  expect(b.buscar).toHaveBeenCalledWith(id, "2026-10-01", "2026-10-16", "001", 2, 10);
  await request(app)
    .get(base + "/transacciones?desde=2026-10-01&hasta=2026-10-16&limite=101")
    .set("Authorization", token())
    .expect(400);
});
