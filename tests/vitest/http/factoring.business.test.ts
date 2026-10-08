import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { boundary as b, ids, liquidationDto, proposalDto, resetFactoringBoundary } from "../support/factoringBoundary.js";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import propuestaRoutes from "#src/routes/admin/servicio/factoring/factoringpropuesta.routes.js";
import liquidacionRoutes from "#src/routes/admin/servicio/factoring/factoringliquidacion.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/v1", propuestaRoutes, liquidacionRoutes);
app.use(errorHandlerMiddleware);
const base = "/api/v1/admin/servicio/factoring";
const paths = {
  propuesta: `${base}/factoringpropuesta/crear`,
  simPropuesta: `${base}/factoringpropuesta/simular/${ids.factoring}`,
  liquidacion: `${base}/factoringliquidacion/crear`,
  simLiquidacion: `${base}/factoringliquidacion/simular/${ids.factoring}`,
};
const token = (role = 2, key = "vitest-factoring-key") => jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, key, { expiresIn: "1h" });

beforeEach(() => {
  resetFactoringBoundary();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-01T05:00:00Z"));
});
afterEach(() => { vi.useRealTimers(); });

describe("Rutas reales de negocio: autenticación y roles antes del acceso a datos", () => {
  for (const path of Object.values(paths)) {
    it(`sin sesión rechaza ${path}`, async () => {
      await request(app).post(path).send({}).expect(403);
      expect(b.transaction).not.toHaveBeenCalled();
    });
    it.each([3, 4, 5, 6])(`rol %s no puede escribir ni simular en ${path}`, async (role) => {
      await request(app).post(path).set("Authorization", `Bearer ${token(role)}`).send({ idusuario: 42, roles: [2] }).expect(403);
      expect(b.transaction).not.toHaveBeenCalled();
    });
  }
  it.each(["invalid", "Basic invalid", "Bearer invalid"])("formato/firma inválida %s no consulta datos", async (authorization) => {
    await request(app).post(paths.propuesta).set("Authorization", authorization).send(proposalDto()).expect(401);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("un JWT firmado con otra clave no concede acceso", async () => {
    await request(app).post(paths.propuesta).set("Authorization", `Bearer ${token(2, "another-key")}`).send(proposalDto()).expect(401);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("una sesión expirada no consulta los DAOs", async () => {
    const expired = jwt.sign({ usuario: { idusuario: 42 }, exp: 1 }, "vitest-factoring-key");
    await request(app).post(paths.liquidacion).set("Authorization", `Bearer ${expired}`).send(liquidationDto()).expect(401);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("un JWT firmado sin identidad de usuario devuelve 401", async () => {
    const malformed = jwt.sign({ dato: "sin usuario" }, "vitest-factoring-key");
    await request(app).post(paths.propuesta).set("Authorization", `Bearer ${malformed}`).send(proposalDto()).expect(401);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("una identidad autenticada sin roles no puede crear propuestas", async () => {
    const noRoles = jwt.sign({ usuario: { idusuario: 42 } }, "vitest-factoring-key");
    await request(app).post(paths.propuesta).set("Authorization", `Bearer ${noRoles}`).send(proposalDto()).expect(403);
    expect(b.transaction).not.toHaveBeenCalled();
  });
});

describe("Validación HTTP de entrada antes de persistir", () => {
  it.each([
    ["financiamiento mayor a uno", { porcentaje_financiado_estimado: 1.01 }],
    ["financiamiento negativo", { porcentaje_financiado_estimado: -0.01 }],
    ["descuento mayor a uno", { porcentaje_comision_descuento: 1.01 }],
    ["descuento negativo", { porcentaje_comision_descuento: -0.01 }],
    ["tasa negativa", { tdm: -0.01 }],
    ["monto cero", { monto_neto: 0 }],
    ["fecha inválida", { fecha_pago_estimado: "invalid" }],
    ["ID inválido", { factoringid: "invalid" }],
    ["monto no numérico", { monto_neto: "invalid" }],
  ])("propuesta: %s devuelve 400 y no abre transacción", async (_label, invalid) => {
    const result = await request(app).post(paths.propuesta).set("Authorization", `Bearer ${token()}`).send({ ...proposalDto(), ...invalid }).expect(400);
    expect(result.body).toEqual({ error: true, message: "Datos no válidos" });
    expect(b.transaction).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageException).not.toHaveBeenCalled();
  });
  it.each([
    ["pago inválido", { fecha_pago_efectivo: "invalid" }],
    ["liquidación inválida", { fecha_liquidacion: "invalid" }],
    ["estado inválido", { factoringliquidacionestadoid: "invalid" }],
    ["concepto inválido", { factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: "invalid" }] }],
    ["cantidad no numérica", { factoring_liquidacion_financieros: [{ financierotipoid: ids.tipo, financieroconceptoid: ids.concepto, cantidad: "invalid" }] }],
  ])("liquidación: %s impide escrituras", async (_label, invalid) => {
    await request(app).post(paths.liquidacion).set("Authorization", `Bearer ${token()}`).send({ ...liquidationDto(), ...invalid }).expect(400);
    expect(b.transaction).not.toHaveBeenCalled();
  });
});

describe("Contrato HTTP hasta servicios y calculadores reales", () => {
  it("simular y crear propuesta concilian importes y usan actor de la sesión", async () => {
    const simulated = await request(app).post(paths.simPropuesta).set("Authorization", `Bearer ${token()}`).send(proposalDto()).expect(201);
    expect(simulated.body.data).toMatchObject({ monto_financiado: "16000", monto_garantia: "4000", monto_descuento: "320", monto_adelanto: "15420.4" });
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
    const created = await request(app).post(paths.propuesta).set("Authorization", `Bearer ${token()}`).send({ ...proposalDto(), idusuario: 999, idusuariocrea: 999, atributo_interno: "ignorar" }).expect(201);
    expect(created.body.data.monto_adelanto).toBe(simulated.body.data.monto_adelanto);
    const header = b.propuesta.insertFactoringpropuesta.mock.calls[0][1];
    expect(header.idusuariocrea).toBe(42);
    expect(created.body.data.factoring).not.toHaveProperty("atributo_interno");
    expect(created.body.data.factoring).not.toHaveProperty("idusuario");
  });
  it("simular y crear liquidación mantienen saldo, fecha e identidad del actor", async () => {
    resetFactoringBoundary(1, 2);
    const simulated = await request(app).post(paths.simLiquidacion).set("Authorization", `Bearer ${token()}`).send(liquidationDto()).expect(201);
    expect(simulated.body.data).toMatchObject({ monto_total_a_favor: "3992.5", monto_total_por_cobrar: "0", dias_mora_efectivo: 0 });
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
    const created = await request(app).post(paths.liquidacion).set("Authorization", `Bearer ${token()}`).send({ ...liquidationDto(), idusuario: 999 }).expect(201);
    expect(created.body.data.monto_total_a_favor).toBe(simulated.body.data.monto_total_a_favor);
    expect(b.liquidacion.insertFactoringliquidacion.mock.calls[0][1].idusuariocrea).toBe(42);
    expect(created.body.data.fecha_pago_efectivo).toBe("2026-10-01T05:00:00.000Z");
  });
  it.each(["propuesta", "liquidacion"] as const)("%s: operación inexistente devuelve 404 sin escrituras", async (kind) => {
    b.factoring.getFactoringByFactoringid.mockResolvedValue(null);
    const result = await request(app).post(paths[kind]).set("Authorization", `Bearer ${token()}`).send(kind === "propuesta" ? proposalDto() : liquidationDto()).expect(404);
    expect(result.body.error).toBe(true);
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
    expect(b.liquidacion.insertFactoringliquidacion).not.toHaveBeenCalled();
  });
  it("error inesperado de persistencia devuelve 500 sin exponer el mensaje interno", async () => {
    b.liquidacion.insertFactoringliquidacion.mockRejectedValueOnce(new Error("detalle privado de conexión"));
    const result = await request(app).post(paths.liquidacion).set("Authorization", `Bearer ${token()}`).send(liquidationDto()).expect(500);
    expect(result.body).toEqual({ error: true, message: "Ocurrió un error" });
    expect(b.telegram.sendMessageException).toHaveBeenCalledOnce();
    expect(b.liquidacionFinanciero.insertFactoringliquidacionfinanciero).not.toHaveBeenCalled();
  });
});
