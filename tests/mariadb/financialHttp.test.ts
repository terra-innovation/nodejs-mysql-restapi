import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { Settings } from "luxon";
import { db, cleanFixtures, seedAuthorization, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";

const boundary = vi.hoisted(() => ({ email: vi.fn(), telegram: vi.fn() }));
const secret = "ft-financial-http-synthetic-secret";
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "ft-financial-http-synthetic-secret" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringPropuestaDisponible: boundary.email }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: boundary.telegram }));
import adminProposal from "#src/routes/admin/servicio/factoring/factoringpropuesta.routes.js";
import financialProposal from "#src/routes/financiero/servicio/factoring/factoringpropuesta.routes.js";
import adminLiquidation from "#src/routes/admin/servicio/factoring/factoringliquidacion.routes.js";
import financialLiquidation from "#src/routes/financiero/servicio/factoring/factoringliquidacion.routes.js";
import adminTransfer from "#src/routes/admin/servicio/factoring/factoringtransferenciacedente.routes.js";
import financialTransfer from "#src/routes/financiero/servicio/factoring/factoringtransferenciacedente.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const app = express(); app.use(express.json());
app.use("/api/v1", adminProposal, financialProposal, adminLiquidation, financialLiquidation, adminTransfer, financialTransfer);
app.use(errorHandlerMiddleware);
const kinds = ["factoringpropuesta", "factoringliquidacion", "factoringtransferenciacedente"] as const;
type Kind = typeof kinds[number];
const unknown = "00000000-0000-0000-0000-000000000000";
const base = (kind: Kind, profile = "admin") => `/api/v1/${profile}/servicio/factoring/${kind}`;
const listStatus = (kind: Kind) => kind === "factoringliquidacion" ? 200 : 201;
let user: Awaited<ReturnType<typeof seedMasters>>;
const originalNow = Settings.now;
beforeEach(async () => {
  vi.clearAllMocks(); boundary.email.mockResolvedValue(undefined);
  Settings.now = () => Date.parse("2026-09-01T05:00:00Z"); user = await seedMasters(); await seedAuthorization(user.idusuario);
});
afterEach(async () => {
  Settings.now = originalNow;
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_financial_http_failure"); await cleanFixtures();
});
afterAll(async () => { await db.$disconnect(); });
function auth(role = 2, expired = false) {
  return `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: role }] }, ...(expired ? { exp: 1 } : {}) }, secret)}`;
}
async function arrange(kind: Kind, currency = "PEN") {
  const f = await seedSettlement(user.idusuario, currency);
  let dto: Record<string, unknown> = kind === "factoringliquidacion" ? { ...f.liquidacionDto } : { ...f.transferenciaDto };
  if (kind === "factoringpropuesta") {
    const tipo = await db.factoring_tipo.create({ data: { nombre: "Prueba", alias: "IT", color: "blue" } });
    const strategy = await db.factoring_estrategia.create({ data: { idfactoringestrategia: 1, code: "IT", nombre_estrategia: "Sintetica" } });
    const risk = await db.riesgo.findFirstOrThrow();
    const state = await db.factoring_propuesta_estado.findUniqueOrThrow({ where: { idfactoringpropuestaestado: 4 } });
    dto = { factoringid: f.factoring.factoringid, factoringtipoid: tipo.factoringtipoid, factoringestrategiaid: strategy.factoringestrategiaid, riesgooperacionid: risk.riesgoid, riesgocedenteid: risk.riesgoid, riesgoaceptanteid: risk.riesgoid, factoringpropuestaestadoid: state.factoringpropuestaestadoid, monto_neto: 20000, porcentaje_financiado_estimado: 0.8, porcentaje_comision_descuento: 0, tdm: 0.02, fecha_pago_estimado: "2026-10-01T05:00:00Z" };
  }
  return { ...f, dto };
}
async function snapshot() {
  const tables = ["factoring", "factoring_propuesta", "factoring_propuesta_historial_estado", "factoring_propuesta_financiero", "factoring_liquidacion", "factoring_liquidacion_financiero", "factoring_transferencia_cedente", "archivo_factoring_transferencia_cedente", "archivo"];
  return Promise.all(tables.map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``)));
}
async function row(kind: Kind) {
  if (kind === "factoringpropuesta") return db.factoring_propuesta.findFirstOrThrow({ orderBy: { idfactoringpropuesta: "desc" } });
  if (kind === "factoringliquidacion") return db.factoring_liquidacion.findFirstOrThrow({ orderBy: { idfactoringliquidacion: "desc" } });
  return db.factoring_transferencia_cedente.findFirstOrThrow({ orderBy: { idfactoringtransferenciacedente: "desc" } });
}
function idOf(saved: Awaited<ReturnType<typeof row>>) {
  return "factoringpropuestaid" in saved ? saved.factoringpropuestaid : "factoringliquidacionid" in saved ? saved.factoringliquidacionid : saved.factoringtransferenciacedenteid;
}
async function create(kind: Kind, dto: Record<string, unknown>) {
  const response = await request(app).post(`${base(kind)}/crear`).set("Authorization", auth()).send({ ...dto, idusuario: 999999, idusuariocrea: 999999, campo_desconocido: "ignorar" }).expect(201);
  expect(response.body.error).toBe(false); expect(response.body.data).not.toHaveProperty("campo_desconocido");
  return response;
}

describe("HTTP administrativo y financiero con MariaDB real", () => {
  for (const kind of kinds) it.each(["PEN", "USD"])(`${kind}, %s: crea con actor de sesión y consulta con ambos perfiles`, async currency => {
    const f = await arrange(kind, currency); const before = await snapshot();
    if (kind !== "factoringtransferenciacedente") {
      const simulated = await request(app).post(`${base(kind)}/simular/${f.factoring.factoringid}`).set("Authorization", auth()).send(f.dto).expect(201);
      expect(simulated.body.error).toBe(false); expect(await snapshot()).toEqual(before);
      expect(Number(kind === "factoringpropuesta" ? simulated.body.data.monto_descuento : simulated.body.data.monto_total_a_favor)).toBe(kind === "factoringpropuesta" ? 320 : 4000);
    }
    await create(kind, f.dto); const saved = await row(kind); const id = idOf(saved);
    expect(saved).toMatchObject({ idusuariocrea: user.idusuario, idusuariomod: user.idusuario, estado: 1, idfactoring: f.factoring.idfactoring });
    if (kind === "factoringpropuesta") {
      const proposal = await db.factoring_propuesta.findUniqueOrThrow({ where: { factoringpropuestaid: id }, include: { factoring_propuesta_financieros: true, factoring_propuesta_historial_estados: true } });
      expect([proposal.monto_financiado, proposal.monto_garantia, proposal.monto_descuento, proposal.monto_adelanto].map(value => value!.toString())).toEqual(["16000", "4000", "320", currency === "PEN" ? "15426.3" : "15438.1"]);
      expect(proposal.factoring_propuesta_financieros).toHaveLength(2);
      expect(proposal.factoring_propuesta_historial_estados[0].idusuariomodifica).toBe(user.idusuario);
    } else if (kind === "factoringliquidacion") {
      const liquidation = await db.factoring_liquidacion.findUniqueOrThrow({ where: { factoringliquidacionid: id }, include: { factoring_liquidacion_financieros: true } });
      expect(liquidation.monto_total_a_favor.toString()).toBe("4000"); expect(liquidation.fecha_pago_efectivo).toEqual(new Date(f.liquidacionDto.fecha_pago_efectivo));
      expect(liquidation.factoring_liquidacion_financieros.length).toBeGreaterThan(0);
    } else {
      const transfer = await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: { factoringtransferenciacedenteid: id } });
      expect(transfer.monto.toString()).toBe("4000.15"); expect(transfer.idmoneda).toBe(currency === "PEN" ? 1 : 2);
      expect(transfer.fecha).toEqual(new Date(f.transferenciaDto.fecha));
      expect(await db.archivo_factoring_transferencia_cedente.count()).toBe(1);
    }
    const after = await snapshot();
    for (const [profile, role] of [["admin", 2], ["financiero", 6]] as const) {
      const result = await request(app).get(`${base(kind, profile)}/buscar/factoring/${f.factoring.factoringid}`).set("Authorization", auth(role)).expect(listStatus(kind));
      expect(result.body.error).toBe(false); expect(result.body.data.some((record: Record<string, unknown>) => record[`${kind}id`] === id)).toBe(true);
      if (kind === "factoringliquidacion") {
        const detail = await request(app).get(`${base(kind, profile)}/detalle/${id}`).set("Authorization", auth(role)).expect(200);
        expect(detail.body.data.factoringliquidacionid).toBe(id); expect(Number(detail.body.data.monto_total_a_favor)).toBe(4000);
      }
    }
    expect(await snapshot()).toEqual(after); expect(boundary.email).not.toHaveBeenCalled();
  });
  for (const kind of kinds) it.each(["sin sesión", "rol financiero", "JWT expirado"])(`${kind}: creación rechaza %s sin escribir`, async scenario => {
    const before = await snapshot(); let req = request(app).post(`${base(kind)}/crear`);
    if (scenario !== "sin sesión") req = req.set("Authorization", auth(scenario === "rol financiero" ? 6 : 2, scenario === "JWT expirado"));
    const result = await req.send({}).expect(scenario === "JWT expirado" ? 401 : 403);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) for (const [profile, role] of [["admin", 2], ["financiero", 6]] as const) it.each(["sin sesión", "rol ajeno", "JWT expirado"])(`${profile}/${kind}: consulta rechaza %s antes de SQL de negocio`, async scenario => {
    const before = await snapshot(); let req = request(app).get(`${base(kind, profile)}/buscar/factoring/${unknown}`);
    if (scenario !== "sin sesión") req = req.set("Authorization", auth(scenario === "rol ajeno" ? (role === 2 ? 6 : 2) : role, scenario === "JWT expirado"));
    const result = await req.expect(scenario === "JWT expirado" ? 401 : 403);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) it.each(["campo requerido", "identificador corto", "fecha inválida", "importe o porcentaje inválido"])(`${kind}: %s devuelve 400 sin cambios`, async scenario => {
    const f = await arrange(kind); const before = await snapshot(); const dto = { ...f.dto };
    if (scenario === "campo requerido") delete dto.factoringid;
    if (scenario === "identificador corto") dto.factoringid = "invalid";
    if (scenario === "fecha inválida") dto[kind === "factoringpropuesta" ? "fecha_pago_estimado" : kind === "factoringliquidacion" ? "fecha_pago_efectivo" : "fecha"] = "invalid";
    if (scenario === "importe o porcentaje inválido") {
      if (kind === "factoringpropuesta") dto.porcentaje_financiado_estimado = 1.01;
      if (kind === "factoringtransferenciacedente") dto.monto = -1;
      if (kind === "factoringliquidacion") dto.factoring_liquidacion_financieros = [{ financierotipoid: unknown, financieroconceptoid: unknown, cantidad: "no-numero" }];
    }
    const result = await request(app).post(`${base(kind)}/crear`).set("Authorization", auth()).send(dto).expect(400);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) it(`${kind}: operación inexistente devuelve 404 y conserva filas previas`, async () => {
    const f = await arrange(kind); const before = await snapshot();
    const result = await request(app).post(`${base(kind)}/crear`).set("Authorization", auth()).send({ ...f.dto, factoringid: unknown }).expect(404);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) it.each(["cabecera", "detalle o vínculo"])(`${kind}: fallo SQL en %s devuelve 500 con rollback`, async stage => {
    const f = await arrange(kind); await create(kind, f.dto); const before = await snapshot();
    const table = kind === "factoringpropuesta" ? stage === "cabecera" ? "factoring_propuesta" : "factoring_propuesta_financiero" : kind === "factoringliquidacion" ? stage === "cabecera" ? "factoring_liquidacion" : "factoring_liquidacion_financiero" : stage === "cabecera" ? "factoring_transferencia_cedente" : "archivo_factoring_transferencia_cedente";
    await db.$executeRawUnsafe(`CREATE TRIGGER it_financial_http_failure BEFORE INSERT ON \`${table}\` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT financial HTTP failure'`);
    const result = await request(app).post(`${base(kind)}/crear`).set("Authorization", auth()).send(f.dto).expect(500);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) it(`${kind}: actualización, baja y activación por HTTP preservan importes y detalles`, async () => {
    const f = await arrange(kind); await create(kind, f.dto); const saved = await row(kind); const id = idOf(saved);
    const state = kind === "factoringpropuesta" ? (await db.factoring_propuesta_estado.findUniqueOrThrow({ where: { idfactoringpropuestaestado: 6 } })).factoringpropuestaestadoid : kind === "factoringliquidacion" ? f.liquidacionEstados[1].factoringliquidacionestadoid : f.transferenciaEstados[1].factoringtransferenciaestadoid;
    const dto = kind === "factoringpropuesta" ? { factoringpropuestaestadoid: state } : kind === "factoringliquidacion" ? { factoringliquidacionestadoid: state, fecha_liquidacion: f.liquidacionDto.fecha_liquidacion } : { factoringtransferenciaestadoid: state };
    await request(app).patch(`${base(kind)}/actualizar/${id}`).set("Authorization", auth()).send({ ...dto, idusuario: 999999 }).expect(200);
    const updated = await row(kind); expect(updated.idusuariomod).toBe(user.idusuario);
    if ("idfactoringpropuestaestado" in updated) expect(updated.idfactoringpropuestaestado).toBe(6);
    if ("idfactoringliquidacionestado" in updated) expect(updated.idfactoringliquidacionestado).toBe(4);
    if ("idfactoringtransferenciaestado" in updated) expect(updated.idfactoringtransferenciaestado).toBe(4);
    const before = await snapshot();
    for (const [action, stateValue] of [["eliminar", 2], ["activar", 1]] as const) {
      const req = action === "eliminar" ? request(app).delete(`${base(kind)}/${action}/${id}`) : request(app).patch(`${base(kind)}/${action}/${id}`);
      const result = await req.set("Authorization", auth()).expect(204); expect(result.text).toBe("");
      const current = await row(kind); expect(current).toEqual({ ...updated, estado: stateValue, fechamod: current.fechamod });
    }
    const after = await snapshot();
    for (const index of [0, 2, 3, 5, 7, 8]) expect(after[index]).toEqual(before[index]);
  });
  for (const kind of kinds) it(`${kind}: ruta financiera de creación no existe (404)`, async () => {
    const before = await snapshot(); await request(app).post(`${base(kind, "financiero")}/crear`).set("Authorization", auth(6)).send({}).expect(404);
    expect(await snapshot()).toEqual(before);
  });
});
