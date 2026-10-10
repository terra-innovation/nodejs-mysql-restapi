import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { db, cleanFixtures, seedAuthorization, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";
import { invoiceWorkspace } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ whitelist: ["*"], blacklist: [] as string[], telegram: vi.fn(), ip: 0, root: "" }));
vi.mock("#src/utils/storageUtils.js", async original => ({ ...await original<typeof import("#src/utils/storageUtils.js")>(), pathApp: () => boundary.root }));
vi.mock("#src/config.js", () => ({ env: { NODE_ENV: "production", TOKEN_KEY_JWT: "it-global-app-secret", TOKEN_KEY_OTP: "it-otp", MAIL_ENCRYPTION_KEY_COFIG: "it-key" }, isProduction: true, isDevelopment: false, isTest: false }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/ipAccessControl.js", () => ({ whitelist: boundary.whitelist, blacklist: boundary.blacklist, isWhitelistAll: () => boundary.whitelist.includes("*"), isBlacklistAll: () => boundary.blacklist.includes("*") }));
vi.mock("#src/utils/logger.pino.js", async () => {
  const { default: pino } = await import("pino"); const logger = pino({ level: "silent" });
  return { loggerInstance: logger, log: logger, line: () => "integration" };
});
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: boundary.telegram }));
vi.mock("#src/providers/email/email.Provider.js", async original => {
  const provider = await original<Record<string, unknown>>();
  return Object.fromEntries(Object.entries(provider).map(([key, value]) => [key, typeof value === "function" ? vi.fn().mockRejectedValue(new Error("IT unexpected outbound email")) : value]));
});
import app from "#src/app.js";
let user: Awaited<ReturnType<typeof seedMasters>>;
let ip: string;
let workspace: ReturnType<typeof invoiceWorkspace>;
const origin = "https://app.finanzatech.com";
const path = "/api/v1/admin/servicio/factoring/factoringliquidacion";
beforeEach(async () => {
  boundary.whitelist.splice(0, Infinity, "*"); boundary.blacklist.splice(0); vi.clearAllMocks();
  ip = `203.0.113.${++boundary.ip}`; user = await seedMasters(); await seedAuthorization(user.idusuario);
  workspace = invoiceWorkspace(); boundary.root = workspace.root;
});
afterEach(async () => { vi.restoreAllMocks(); try { await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_app_http_failure"); await cleanFixtures(); } finally { workspace?.cleanup(); } });
afterAll(async () => { await db.$disconnect(); });
function headers(req: request.Test) { return req.set("Origin", origin).set("X-Forwarded-For", ip).set("User-Agent", "Mozilla/5.0 Integration"); }
function token(role = 2, options: jwt.SignOptions = {}) { return `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: role }] } }, "it-global-app-secret", options)}`; }
async function snapshot() {
  return Promise.all(["factoring", "factoring_propuesta", "factoring_liquidacion", "factoring_liquidacion_financiero", "archivo"].map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``)));
}
describe("Montaje global real de Express con MariaDB", () => {
  it("raíz pública pasa filtros, CORS, trazabilidad y Helmet", async () => {
    const before = await snapshot(); const response = await headers(request(app).get("/")).expect(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-expose-headers"]).toContain("Content-Disposition");
    expect(response.headers["x-correlation-id"]).toBeTruthy(); expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-content-type-options"]).toBe("nosniff"); expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(await snapshot()).toEqual(before);
  });
  it("ping consulta MariaDB desde la ruta pública real", async () => { const result = await headers(request(app).get("/ping")).expect(200); expect(result.body.result).toBe("pong"); });
  it("ruta desconocida llega al manejador 404 JSON y conserva SQL", async () => {
    const before = await snapshot(); const response = await headers(request(app).get("/api/v1/it-no-existe")).expect(404);
    expect(response.body.error).toBe(true); expect(response.headers["x-frame-options"]).toBe("DENY"); expect(await snapshot()).toEqual(before);
  });
  for (const endpoint of [
    `${path}/master/factoring/00000000-0000-0000-0000-000000000000`,
    "/api/v1/financiero/servicio/factoring/factoringliquidacion/master/factoring/00000000-0000-0000-0000-000000000000",
    "/api/v1/empresario/servicio/factoring/factoring/listar",
    "/api/v1/inversionista/factoring/factoring/listar",
    "/api/v1/usuario/archivo/descargar/00000000-0000-0000-0000-000000000000",
  ]) it(`router montado: ${endpoint} exige sesión`, async () => {
    const before = await snapshot(); const result = await headers(request(app).get(endpoint)).expect(403);
    expect(result.body.message).toContain("token"); expect(await snapshot()).toEqual(before);
  });
  it("router secure montado exige sesión para actualizar accesos", async () => { await headers(request(app).post("/api/v1/secure/actualizar-accesos")).expect(403); });
  for (const scenario of ["ausente", "formato", "expirado", "firma", "rol"] as const) it(`creación real rechaza sesión ${scenario} sin escrituras`, async () => {
    const before = await snapshot(); let req = headers(request(app).post(`${path}/crear`));
    if (scenario !== "ausente") req = req.set("Authorization", scenario === "formato" ? "Token incorrecto" : scenario === "firma" ? `Bearer ${jwt.sign({ usuario: {} }, "wrong")}` : token(scenario === "rol" ? 6 : 2, scenario === "expirado" ? { expiresIn: -1 } : {}));
    await req.send({}).expect(scenario === "ausente" || scenario === "rol" ? 403 : 401); expect(await snapshot()).toEqual(before);
  });
  it("Zod devuelve 400 a través del manejador global, sin escrituras", async () => {
    const before = await snapshot(); const result = await headers(request(app).post(`${path}/crear`)).set("Authorization", token()).send({}).expect(400);
    expect(result.body.error).toBe(true); expect(boundary.telegram).not.toHaveBeenCalled(); expect(await snapshot()).toEqual(before);
  });
  it.each(["PEN", "USD"])("%s: crea y relee liquidación con permisos reales de ambos perfiles", async currency => {
    const fixture = await seedSettlement(user.idusuario, currency);
    await headers(request(app).post(`${path}/crear`)).set("Authorization", token()).send(fixture.liquidacionDto).expect(201);
    const stored = await db.factoring_liquidacion.findFirstOrThrow(); expect(stored.monto_total_a_favor.toString()).toBe("4000"); expect(stored.idusuariocrea).toBe(user.idusuario);
    for (const [profile, role] of [["admin", 2], ["financiero", 6]] as const) {
      const result = await headers(request(app).get(`/api/v1/${profile}/servicio/factoring/factoringliquidacion/detalle/${stored.factoringliquidacionid}`)).set("Authorization", token(role)).expect(200);
      expect(result.body.error).toBe(false);
    }
  });
  it("fallo SQL devuelve 500 global y revierte cabecera/detalles", async () => {
    const fixture = await seedSettlement(user.idusuario); const before = await snapshot();
    await db.$executeRawUnsafe("CREATE TRIGGER it_app_http_failure BEFORE INSERT ON factoring_liquidacion_financiero FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'IT app SQL failure'");
    const result = await headers(request(app).post(`${path}/crear`)).set("Authorization", token()).send(fixture.liquidacionDto).expect(500);
    expect(result.body.error).toBe(true); expect(boundary.telegram).not.toHaveBeenCalled(); expect(await snapshot()).toEqual(before);
  });
  it("error inesperado de conexión llega a 500 global y notifica solo al proveedor sustituido", async () => {
    const before = await snapshot(); vi.spyOn(db, "$transaction").mockRejectedValueOnce(new Error("IT unexpected connection failure"));
    const result = await headers(request(app).get("/ping")).expect(500);
    expect(result.body.message).toBe("Ocurrió un error"); expect(boundary.telegram).toHaveBeenCalledOnce(); expect(await snapshot()).toEqual(before);
  });
  for (const scenario of ["blacklist", "blacklist global", "whitelist vacía", "fuera de whitelist"] as const) it(`filtro IP real: ${scenario} rechaza antes de CORS y rutas`, async () => {
    if (scenario.startsWith("blacklist")) boundary.blacklist.push(scenario === "blacklist" ? ip : "*");
    else boundary.whitelist.splice(0, Infinity, ...(scenario === "whitelist vacía" ? [] : ["192.0.2.0/24"]));
    const before = await snapshot(); const result = await headers(request(app).get("/")).expect(403);
    expect(result.body.message).toBe("Acceso denegado"); expect(result.headers["access-control-allow-origin"]).toBeUndefined(); expect(await snapshot()).toEqual(before);
  });
  it("User-Agent bloqueado devuelve 404 vacío en producción", async () => {
    const result = await headers(request(app).get("/")).set("User-Agent", "curl/8.0").expect(404); expect(result.text).toBe("");
  });
  for (const allowed of [false, true]) it(`preflight CORS: origen ${allowed ? "permitido" : "ajeno"}`, async () => {
    const before = await snapshot(); const result = await headers(request(app).options(`${path}/crear`)).set("Origin", allowed ? origin : "https://it-untrusted.invalid").set("Access-Control-Request-Method", "POST").expect(allowed ? 204 : 404);
    expect(result.headers["access-control-allow-origin"]).toBe(allowed ? origin : undefined); expect(await snapshot()).toEqual(before);
  });
  it("producción rechaza solicitudes sin Origin mediante CORS, incluso en ping", async () => {
    const result = await request(app).get("/ping").set("X-Forwarded-For", ip).expect(404); expect(result.body.error).toBe(true);
  });
  it("JSON inválido devuelve 400 antes de filtros y conserva SQL", async () => {
    const before = await snapshot(); const result = await headers(request(app).post(`${path}/crear`)).set("Content-Type", "application/json").send('{"broken":').expect(400);
    expect(result.body.error).toBe(true); expect(result.headers["x-frame-options"]).toBeUndefined(); expect(await snapshot()).toEqual(before);
  });
  it("limitador global real: 500 solicitudes admitidas y siguiente 429 por IP", async () => {
    const before = await snapshot();
    for (let index = 0; index < 500; index++) await headers(request(app).get("/")).expect(200);
    const result = await headers(request(app).get("/")).expect(429); expect(result.body.message).toContain("Demasiadas solicitudes");
    await headers(request(app).get("/")).set("X-Forwarded-For", "198.51.100.77").expect(200); expect(await snapshot()).toEqual(before);
  });
});
