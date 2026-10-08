import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { db, cleanFixtures, seedMasters } from "./businessSupport.js";
import bcrypt from "bcryptjs";
import { invoiceWorkspace } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ whitelist: ["*"], blacklist: [] as string[], telegram: vi.fn(), loginNotice: vi.fn(), ip: 0, root: "" }));
vi.mock("#src/utils/storageUtils.js", async original => ({ ...await original<typeof import("#src/utils/storageUtils.js")>(), pathApp: () => boundary.root }));
vi.mock("#src/config.js", () => ({ env: { NODE_ENV: "production", TOKEN_KEY_JWT: "it-global-app-secret", TOKEN_KEY_OTP: "it-otp", MAIL_ENCRYPTION_KEY_COFIG: "it-key" }, isProduction: true, isDevelopment: false, isTest: false }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/ipAccessControl.js", () => ({ whitelist: boundary.whitelist, blacklist: boundary.blacklist, isWhitelistAll: () => boundary.whitelist.includes("*"), isBlacklistAll: () => boundary.blacklist.includes("*") }));
vi.mock("#src/utils/logger.pino.js", async () => {
  const { default: pino } = await import("pino"); const logger = pino({ level: "silent" });
  return { loggerInstance: logger, log: logger, line: () => "integration" };
});
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: boundary.telegram, sendMessageImportant: boundary.loginNotice }));
vi.mock("#src/providers/email/email.Provider.js", async original => {
  const provider = await original<Record<string, unknown>>();
  return Object.fromEntries(Object.entries(provider).map(([key, value]) => [key, typeof value === "function" ? vi.fn().mockRejectedValue(new Error("IT unexpected outbound email")) : value]));
});
import app from "#src/app.js";
let user: Awaited<ReturnType<typeof seedMasters>>;
let workspace: ReturnType<typeof invoiceWorkspace>;
let ip: string;
const password = "IT-Synthetic-Password-2026";
const hash = bcrypt.hashSync(password, 4); // Solo fixture; no cambia el coste de producción.
const secret = "it-global-app-secret";
const origin = "https://app.finanzatech.com";
const refreshPath = "/api/v1/secure/actualizar-accesos";
beforeEach(async () => {
  vi.clearAllMocks(); boundary.whitelist.splice(0, Infinity, "*"); boundary.blacklist.splice(0);
  workspace = invoiceWorkspace(); boundary.root = workspace.root; ip = `192.0.2.${++boundary.ip}`;
  user = await seedMasters();
  await db.usuario.update({ where: { idusuario: user.idusuario }, data: { ispersonavalidated: true } });
  await db.credencial.create({ data: { code: "IT-CRED", idusuario: user.idusuario, password: hash } });
  for (const idrol of [2, 3, 4, 5, 6]) await db.rol.create({ data: { idrol, code: `IT-${idrol}`, codigo: `IT-${idrol}`, nombre: "Sintético", alias: "IT" } });
  await db.usuario_rol.create({ data: { idusuario: user.idusuario, idrol: 2 } });
});
afterEach(async () => {
  vi.restoreAllMocks();
  try { await db.usuario_rol.deleteMany(); await db.credencial.deleteMany(); await db.rol.deleteMany(); await cleanFixtures(); }
  finally { workspace?.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });
function headers(req: request.Test) { return req.set("Origin", origin).set("X-Forwarded-For", ip).set("User-Agent", "Mozilla/5.0 Integration"); }
function login(data = { email: user.email, password }) { return headers(request(app).post("/api/v1/secure/login")).send(data); }
function refresh(token: string) { return headers(request(app).post(refreshPath)).set("Authorization", `Bearer ${token}`); }
function decoded(token: string) { return jwt.verify(token, secret) as jwt.JwtPayload; }
function roles(token: string): number[] { return decoded(token).usuario.usuario_roles.map((role: { idrol: number }) => role.idrol); }
async function snapshot() { return Promise.all(["usuario", "credencial", "rol", "usuario_rol"].map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``))); }
async function signedIn() { const response = await login().expect(201); return response.body.data.token as string; }
const adminPath = "/api/v1/admin/servicio/factoring/factoringliquidacion/master/factoring/00000000-0000-0000-0000-000000000000";
describe("Login y refresco de accesos: app real, bcrypt y MariaDB", () => {
  it.each([2, 3, 4, 5, 6])("login rol %s emite JWT firmado y conserva credenciales", async role => {
    await db.usuario_rol.update({ where: { idusuario_idrol: { idusuario: user.idusuario, idrol: 2 } }, data: { idrol: role } });
    const before = await snapshot(); const result = await login().expect(201); const payload = decoded(result.body.data.token);
    expect(result.body.data.usuarioid).toBe(user.usuarioid); expect(payload.usuario.idusuario).toBe(user.idusuario);
    expect(roles(result.body.data.token)).toEqual([role]); expect(payload.exp! - payload.iat!).toBe(24 * 3600);
    expect(payload.usuario).not.toHaveProperty("credencial"); expect(payload.usuario).not.toHaveProperty("password");
    expect(boundary.loginNotice).toHaveBeenCalledOnce(); expect(await snapshot()).toEqual(before);
  });
  for (const scenario of ["correo ajeno", "password incorrecta", "email inválido", "password corta", "password ausente"] as const) it(`login rechaza ${scenario} sin cambiar SQL`, async () => {
    const before = await snapshot(); const data = { email: user.email, password };
    if (scenario === "correo ajeno") data.email = "nobody@example.test";
    if (scenario === "password incorrecta") data.password = "IT-wrong-password";
    if (scenario === "email inválido") data.email = "no-email";
    if (scenario === "password corta") data.password = "123";
    if (scenario === "password ausente") delete (data as Partial<typeof data>).password;
    const result = await login(data).expect(scenario === "correo ajeno" || scenario === "password incorrecta" ? 404 : 400);
    expect(result.body.error).toBe(true); expect(result.body.data).toBeUndefined(); expect(boundary.loginNotice).not.toHaveBeenCalled(); expect(await snapshot()).toEqual(before);
  });
  it("refresco conserva exp/iat, depura perfil y produce menú administrativo", async () => {
    const token = await signedIn(); const before = await snapshot(); const original = decoded(token);
    const response = await refresh(token).expect(200); const current = decoded(response.body.data.token);
    expect([current.exp, current.iat]).toEqual([original.exp, original.iat]); expect(current.usuario.idusuario).toBe(user.idusuario);
    expect(current.usuario).not.toHaveProperty("hash"); expect(response.body.data.usuario).not.toHaveProperty("idusuario");
    expect(JSON.stringify(response.body.data.usuario)).not.toContain(hash); expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.stringify(response.body.data.menu)).toContain("admin-group-mantenimiento"); expect(await snapshot()).toEqual(before);
  });
  it("refresco incorpora rol financiero posterior al login sin extender la sesión", async () => {
    const old = await signedIn(); await db.usuario_rol.create({ data: { idusuario: user.idusuario, idrol: 6 } }); const before = await snapshot();
    const result = await refresh(old).expect(200); expect(roles(result.body.data.token).sort()).toEqual([2, 6]); expect(roles(old)).toEqual([2]);
    const financialPath = adminPath.replace("/admin/", "/financiero/");
    await headers(request(app).get(financialPath)).set("Authorization", `Bearer ${old}`).expect(403);
    await headers(request(app).get(financialPath)).set("Authorization", `Bearer ${result.body.data.token}`).expect(404);
    expect(decoded(result.body.data.token).exp).toBe(decoded(old).exp); expect(JSON.stringify(result.body.data.menu)).toContain("financiero-group-sbs"); expect(await snapshot()).toEqual(before);
  });
  for (const estado of [0, 2]) for (const mode of ["vínculo inactivo", "rol inactivo"] as const) it(`refresco retira ${mode} estado ${estado}; revoca también permisos del JWT anterior`, async () => {
    const old = await signedIn();
    if (mode === "vínculo inactivo") await db.usuario_rol.update({ where: { idusuario_idrol: { idusuario: user.idusuario, idrol: 2 } }, data: { estado } });
    else await db.rol.update({ where: { idrol: 2 }, data: { estado } });
    const before = await snapshot(); const result = await refresh(old).expect(200);
    expect(roles(result.body.data.token)).toEqual([]); expect(result.body.data.menu.items).toEqual([]);
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${result.body.data.token}`).expect(403);
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${old}`).expect(403);
    expect(await snapshot()).toEqual(before);
  });
  it("login sin credencial devuelve 404 sin token ni notificación", async () => {
    await db.credencial.deleteMany(); const before = await snapshot();
    await login().expect(404); expect(boundary.loginNotice).not.toHaveBeenCalled(); expect(await snapshot()).toEqual(before);
  });
  it("retirar físicamente el vínculo revoca el JWT previo", async () => {
    const old = await signedIn(); await db.usuario_rol.deleteMany(); const before = await snapshot();
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${old}`).expect(403); expect(await snapshot()).toEqual(before);
  });
  it("desactivar cuenta después del login rechaza JWT previo en rutas protegidas", async () => {
    const old = await signedIn(); await db.usuario.update({ where: { idusuario: user.idusuario }, data: { estado: 2 } }); const before = await snapshot();
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${old}`).expect(401); expect(await snapshot()).toEqual(before);
  });
  it("JWT firmado con rol ajeno a SQL no concede ese permiso", async () => {
    await db.usuario_rol.update({ where: { idusuario_idrol: { idusuario: user.idusuario, idrol: 2 } }, data: { idrol: 6 } }); const before = await snapshot();
    const token = jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: 2 }] } }, secret, { expiresIn: 3600 });
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${token}`).expect(403); expect(await snapshot()).toEqual(before);
  });
  it("fallo al leer permisos vigentes no autoriza con el JWT anterior", async () => {
    const old = await signedIn(); const before = await snapshot();
    vi.spyOn(db.usuario, "findFirst").mockRejectedValueOnce(new Error("IT current permissions failure"));
    await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${old}`).expect(500); expect(boundary.telegram).toHaveBeenCalledOnce(); expect(await snapshot()).toEqual(before);
  });
  for (const estado of [0, 2]) for (const target of ["usuario", "credencial", "vínculo", "rol"] as const) it(`login con ${target} estado ${estado}: solo estado 1 autentica y concede roles`, async () => {
    if (target === "usuario") await db.usuario.update({ where: { idusuario: user.idusuario }, data: { estado } });
    if (target === "credencial") await db.credencial.update({ where: { idusuario: user.idusuario }, data: { estado } });
    if (target === "vínculo") await db.usuario_rol.update({ where: { idusuario_idrol: { idusuario: user.idusuario, idrol: 2 } }, data: { estado } });
    if (target === "rol") await db.rol.update({ where: { idrol: 2 }, data: { estado } });
    const before = await snapshot(); const result = await login().expect(target === "usuario" || target === "credencial" ? 404 : 201);
    if (target === "usuario" || target === "credencial") { expect(result.body.data).toBeUndefined(); expect(boundary.loginNotice).not.toHaveBeenCalled(); }
    else { expect(roles(result.body.data.token)).toEqual([]); await headers(request(app).get(adminPath)).set("Authorization", `Bearer ${result.body.data.token}`).expect(403); }
    expect(await snapshot()).toEqual(before);
  });
  for (const scenario of ["expirado", "sin exp", "usuario inexistente", "sin idusuario"] as const) it(`refresco rechaza ${scenario} sin escrituras`, async () => {
    const before = await snapshot(); const payload = { usuario: { idusuario: scenario === "usuario inexistente" ? 999999 : scenario === "sin idusuario" ? 0 : user.idusuario } };
    const token = jwt.sign(payload, secret, scenario === "sin exp" ? {} : { expiresIn: scenario === "expirado" ? -1 : 3600 });
    await refresh(token).expect(401); expect(await snapshot()).toEqual(before);
  });
  it("fallo de lectura Prisma en refresco devuelve 500 y conserva SQL", async () => {
    const token = await signedIn(); const before = await snapshot(); vi.spyOn(db, "$transaction").mockRejectedValueOnce(new Error("IT access read failure"));
    await refresh(token).expect(500); expect(await snapshot()).toEqual(before); expect(boundary.telegram).toHaveBeenCalledOnce();
  });
  it("login limita diez intentos por IP; otra IP puede autenticar", async () => {
    const before = await snapshot(); for (let n = 0; n < 10; n++) await login({ email: user.email, password: "IT-wrong-password" }).expect(404);
    await login().expect(429); ip = "198.51.100.201"; await login().expect(201); expect(await snapshot()).toEqual(before);
  });
  it("refresco limita diez solicitudes por usuario, aunque cambie IP, con Retry-After", async () => {
    const token = await signedIn(); const before = await snapshot();
    for (let n = 0; n < 10; n++) { ip = `198.51.100.${n + 1}`; await refresh(token).expect(200); }
    const denied = await refresh(token).expect(429); expect(Number(denied.headers["retry-after"])).toBeGreaterThan(0);
    expect(await snapshot()).toEqual(before);
    const other = await db.usuario.create({ data: { iddocumentotipo: 1, usuarionombres: "Otro sintético", apellidopaterno: "Prueba", apellidomaterno: "Prueba", celular: "000000000", code: "IT-OTHER", email: "other@example.test", hash: "it-other", documentonumero: "IT-OTHER" } });
    const otherToken = jwt.sign({ usuario: { idusuario: other.idusuario } }, secret, { expiresIn: 3600 });
    await refresh(otherToken).expect(200);
    // Solo el segundo usuario es preparación adicional; no cambia el primero.
    expect((await snapshot()).slice(1)).toEqual(before.slice(1));
  });
});
