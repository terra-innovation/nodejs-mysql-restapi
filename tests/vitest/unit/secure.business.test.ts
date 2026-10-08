import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const h = vi.hoisted(() => ({
  transaction: vi.fn(), findUsuario: vi.fn(), findSuscripcion: vi.fn(),
  authenticate: vi.fn(), getRoles: vi.fn(), getHash: vi.fn(),
  getValidation: vi.fn(), updateValidation: vi.fn(), getCredential: vi.fn(), updateCredential: vi.fn(),
  notify: vi.fn(),
}));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "business-jwt-key", TOKEN_KEY_OTP: "business-otp-key" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: h.transaction, usuario: { findFirst: h.findUsuario }, usuario_servicio: { findFirst: h.findSuscripcion } }, transactionTimeout: 5000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({}));
vi.mock("#src/providers/email/emailSender.js", () => ({ default: class {} }));
vi.mock("#src/providers/email/TemplateManager.js", () => ({ default: class {} }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: h.notify }));
vi.mock("#src/daos/usuario.Dao.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("#src/daos/usuario.Dao.js")>(),
  autenticarUsuario: h.authenticate, getUsuarioAndRolesByEmail: h.getRoles, getUsuarioByHash: h.getHash,
}));
vi.mock("#src/daos/validacion.Dao.js", () => ({ getValidacionByIdusuarioAndCodigo: h.getValidation, updateValidacion: h.updateValidation }));
vi.mock("#src/daos/credencial.Dao.js", () => ({ getCredencialByIdusuario: h.getCredential, updateCredencial: h.updateCredential }));

import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { loginUserService, resetPasswordService } from "#src/services/secure/secure.Service.js";
import { actualizarAccesosService } from "#src/services/secure/accesos.Service.js";
import { getEstadoSuscripcionService } from "#src/services/usuario/usuarioservicioestadoConsulta.Service.js";
import { encryptText } from "#src/utils/cryptoUtils.js";
import type { UsuarioSession } from "#src/types/UsuarioSession.types.js";

const password = "Fixture-pass-123";
const passwordHash = bcrypt.hashSync(password, 4);
const fixtureTime = Date.parse("2026-09-01T05:00:00Z");
const fixtureEpoch = Math.floor(fixtureTime / 1000);
const role = (idrol: number) => ({ idrol, estado: 1, rol: { estado: 1, code: `role-${idrol}` } });
const user = () => ({ idusuario: 42, usuarioid: "11111111-1111-4111-8111-111111111111", email: "user@example.test", estado: 1, ispersonavalidated: true, usuario_roles: [role(5), role(3)], hash: "private-hash", password: "private-password", emailvalidationcode: "private-otp" });
const session = (): UsuarioSession => ({ usuario: user() as unknown as UsuarioSession["usuario"], iat: fixtureEpoch - 100, exp: fixtureEpoch + 600 });
const validation = () => ({ validacionid: "validation-test", otp: "123456", verificado: 0, tiempo_marca: new Date("2026-09-01T05:00:00Z"), tiempo_expiracion: 5 });
const resetDto = () => ({ hash: "hash-test", codigo: "reset-password", token: encryptText("123456", "business-otp-key"), password: "New-fixture-password-123" });

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(fixtureTime));
  h.transaction.mockImplementation(async (callback) => callback(prismaFT.client));
  h.authenticate.mockResolvedValue({ email: "user@example.test", usuarioid: user().usuarioid, credencial: { password: passwordHash } });
  h.getRoles.mockResolvedValue({ idusuario: 42, usuarioid: user().usuarioid, email: "user@example.test", usuario_roles: [role(5), role(3)] });
  h.findUsuario.mockResolvedValue(user());
  h.findSuscripcion.mockResolvedValue({ usuarioservicioid: "subscription-test", idservicio: 1, idusuarioservicioestado: 2, usuario_servicio_estado: { alias: "SUSCRITO" } });
  h.getHash.mockResolvedValue({ idusuario: 42 });
  h.getValidation.mockResolvedValue(validation());
  h.getCredential.mockResolvedValue({ credencialid: "credential-test" });
  h.updateCredential.mockResolvedValue([1]);
  h.updateValidation.mockResolvedValue([1]);
});
afterEach(() => { vi.useRealTimers(); });

describe("Login con bcrypt y JWT reales", () => {
  it("credenciales correctas producen token con la identidad y roles consultados", async () => {
    const result = await loginUserService({ email: "user@example.test", password });
    const payload = jwt.verify(result.token, "business-jwt-key") as jwt.JwtPayload;
    expect(payload.usuario.idusuario).toBe(42);
    expect(payload.usuario.usuario_roles.map((item) => item.idrol)).toEqual([5, 3]);
    expect(result.usuarioid).toBe(user().usuarioid);
    expect(h.getRoles).toHaveBeenCalledWith(prismaFT.client, "user@example.test");
    expect(h.notify).toHaveBeenCalledOnce();
  });
  it.each(["inexistente", "contraseña", "sin contraseña"])("rechaza usuario/credencial %s sin emitir notificación", async (kind) => {
    if (kind === "inexistente") h.authenticate.mockResolvedValue(null);
    if (kind === "sin contraseña") h.authenticate.mockResolvedValue({ email: "user@example.test", credencial: { password: "" } });
    await expect(loginUserService({ email: "user@example.test", password: kind === "contraseña" ? "incorrecta" : password })).rejects.toMatchObject({ statusCode: 404 });
    expect(h.getRoles).not.toHaveBeenCalled();
    expect(h.notify).not.toHaveBeenCalled();
  });
  it("un fallo de lectura de credenciales no se convierte en login exitoso", async () => {
    const error = new Error("lectura fallida");
    h.authenticate.mockRejectedValueOnce(error);
    await expect(loginUserService({ email: "user@example.test", password })).rejects.toBe(error);
    expect(h.notify).not.toHaveBeenCalled();
  });
});

describe("Recuperación de contraseña con cifrado y hash reales", () => {
  it("actualiza el hash y marca la validación utilizada sin guardar contraseña en claro", async () => {
    const dto = resetDto();
    await expect(resetPasswordService(42, dto)).resolves.toEqual({ hash: dto.hash });
    const [tx, credentialId, change] = h.updateCredential.mock.calls[0];
    expect(tx).toBe(prismaFT.client);
    expect(credentialId).toBe("credential-test");
    expect(change.password).not.toBe(dto.password);
    expect(bcrypt.compareSync(dto.password, change.password)).toBe(true);
    expect(bcrypt.compareSync(password, change.password)).toBe(false);
    expect(change.idusuariomod).toBe(42);
    expect(h.updateValidation).toHaveBeenCalledWith(tx, "validation-test", expect.objectContaining({ verificado: 1, idusuariomod: 42, fecha_verificado: new Date() }));
  }, 15000); // Hash y dos verificaciones bcrypt reales (coste 12), también bajo cobertura.
  it.each(["usuario", "validación", "OTP", "usada", "vencida", "credencial"])("recuperación con %s inválida no escribe", async (kind) => {
    const dto = resetDto();
    if (kind === "usuario") h.getHash.mockResolvedValue(null);
    if (kind === "validación") h.getValidation.mockResolvedValue(null);
    if (kind === "OTP") dto.token = encryptText("000000", "business-otp-key");
    if (kind === "usada") h.getValidation.mockResolvedValue({ ...validation(), verificado: 1 });
    if (kind === "vencida") vi.setSystemTime(new Date("2026-09-01T05:05:10.001Z"));
    if (kind === "credencial") h.getCredential.mockResolvedValue(null);
    await expect(resetPasswordService(42, dto)).rejects.toMatchObject({ statusCode: 404 });
    expect(h.updateCredential).not.toHaveBeenCalled();
    expect(h.updateValidation).not.toHaveBeenCalled();
  });
  it("si no se actualiza la credencial, no consume el código de validación", async () => {
    h.updateCredential.mockResolvedValueOnce([0]);
    await expect(resetPasswordService(42, resetDto())).rejects.toMatchObject({ statusCode: 404 });
    expect(h.updateValidation).not.toHaveBeenCalled();
  });
  it("un fallo de persistencia de credencial no consume la validación", async () => {
    const error = new Error("escritura de credencial fallida");
    h.updateCredential.mockRejectedValueOnce(error);
    await expect(resetPasswordService(42, resetDto())).rejects.toBe(error);
    expect(h.updateValidation).not.toHaveBeenCalled();
  });
});

describe("Actualizar accesos conserva vigencia y privacidad", () => {
  it("reemplaza roles retirados, conserva exp/iat y limpia secretos recursivamente", async () => {
    const current = user();
    current.usuario_roles = [role(5)];
    h.findUsuario.mockResolvedValue(current);
    const result = await actualizarAccesosService(session());
    const decoded = jwt.verify(result.token, "business-jwt-key") as jwt.JwtPayload;
    expect(decoded.exp).toBe(session().exp);
    expect(decoded.iat).toBe(session().iat);
    expect(decoded.usuario.usuario_roles.map((item) => item.idrol)).toEqual([5]);
    for (const key of ["password", "hash", "emailvalidationcode"]) {
      expect(decoded.usuario).not.toHaveProperty(key);
      expect(result.usuario).not.toHaveProperty(key);
    }
    expect(result.usuario).not.toHaveProperty("idusuario");
    expect(result.menu.items.some((item) => item.id === "empresario-group-factoring-electronico")).toBe(false);
    expect(h.findUsuario).toHaveBeenCalledWith(expect.objectContaining({ where: { idusuario: 42, estado: 1 }, include: { usuario_roles: { where: { estado: 1, rol: { estado: 1 } }, include: { rol: true } } } }));
  });
  it.each([undefined, NaN, Infinity, 0, fixtureEpoch])("expiración inválida %s no inicia consulta", async (exp) => {
    await expect(actualizarAccesosService({ ...session(), exp })).rejects.toMatchObject({ statusCode: 401 });
    expect(h.transaction).not.toHaveBeenCalled();
  });
  it("una sesión que vence durante la lectura no recibe token renovado", async () => {
    h.findUsuario.mockImplementation(async () => {
      vi.setSystemTime(new Date(session().exp * 1000));
      return user();
    });
    await expect(actualizarAccesosService(session())).rejects.toMatchObject({ statusCode: 401 });
  });
  it("usuario inexistente o inactivo no obtiene token", async () => {
    h.findUsuario.mockResolvedValue(null);
    await expect(actualizarAccesosService(session())).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("Suscripciones: pertenencia y estados", () => {
  it.each([1, 2, 3])("estado %s consulta únicamente la suscripción del propietario", async (estado) => {
    h.findSuscripcion.mockResolvedValue({ usuarioservicioid: "subscription-test", idservicio: 1, idusuarioservicioestado: estado, usuario_servicio_estado: { alias: "fixture" } });
    expect(await getEstadoSuscripcionService(42, "subscription-test")).toMatchObject({ suscrito: estado === 2, acceso: { idrol: 3 } });
    expect(h.findSuscripcion).toHaveBeenCalledWith(expect.objectContaining({ where: { usuarioservicioid: "subscription-test", idusuario: 42, estado: 1, usuario: { estado: 1 } } }));
  });
  it("suscripción ajena o inexistente devuelve 404", async () => {
    h.findSuscripcion.mockResolvedValue(null);
    await expect(getEstadoSuscripcionService(99, "subscription-test")).rejects.toMatchObject({ statusCode: 404 });
  });
  it("servicio no integrado no entrega una ruta de acceso", async () => {
    h.findSuscripcion.mockResolvedValue({ usuarioservicioid: "subscription-test", idservicio: 99, idusuarioservicioestado: 2 });
    expect(await getEstadoSuscripcionService(42, "subscription-test")).toMatchObject({ suscrito: true, acceso: null });
  });
});
