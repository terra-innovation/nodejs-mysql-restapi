import { beforeEach, afterEach, expect, it, vi } from "vitest";
const b = vi.hoisted(() => ({ update: vi.fn(), create: vi.fn(), connect: vi.fn(), row: {} as Record<string, unknown> }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: (work: (t: object) => unknown) => work({}) } } }));
vi.mock("#src/daos/configuracionbbdd.Dao.js", () => ({ connection: async () => b.row, connections: async () => [b.row], connectionUpdate: b.update, connectionCreate: b.create, withConnectionLock: async (_id: string, work: () => unknown) => work() }));
vi.mock("mariadb", () => ({ default: { createConnection: b.connect } }));
import { guardarConexion } from "#src/services/admin/configuracionbbdd.Service.js";
const uuid = "00000000-0000-4000-8000-000000000001";
const input = { alias: "Nueva", motor: "MYSQL" as const, host: "inexistente.invalid", puerto: 3306, base_datos: "manual", usuario: "nuevo", habilitado: true, tls_habilitado: true };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("BBDD_KEYS", "{}");
  vi.stubEnv("BBDD_ACTIVE_KEY", "");
  b.row = { idconfiguracionbbdd: 5, configuracionbbddid: uuid, alias: "Anterior", password_cifrado: new Uint8Array([1]), password_nonce: new Uint8Array(12), password_tag: new Uint8Array(16), clave_version: "v1", cifrado_version: 1 };
  b.update.mockResolvedValue({ count: 1 });
});
afterEach(() => vi.unstubAllEnvs());
it("persiste la decisión explícita sin TLS manteniendo el sobre cifrado anterior", async () => {
  await guardarConexion(uuid, { ...input, tls_habilitado: false }, 42, 7);
  expect(b.update.mock.calls[0][3]).toMatchObject({ tls_habilitado: 0 });
  expect(b.update.mock.calls[0][3]).not.toHaveProperty("password_cifrado");
  expect(b.connect).not.toHaveBeenCalled();
});
it("permite actualizar y habilitar sin red ni clave cuando se conserva la contraseña", async () => {
  await guardarConexion(uuid, input, 42, 7);
  expect(b.update).toHaveBeenCalledWith(expect.anything(), 5, 7, expect.objectContaining({ host: "inexistente.invalid", base_datos: "manual", usuario: "nuevo", habilitado: 1 }));
  expect(b.update.mock.calls[0][3]).not.toHaveProperty("password_cifrado");
  expect(b.connect).not.toHaveBeenCalled();
});
it("clave ausente impide guardar una contraseña nueva y da instrucciones sin revelar el secreto", async () => {
  await expect(guardarConexion(null, { ...input, password: "secreto-sintetico" }, 42)).rejects.toThrow("BBDD_ACTIVE_KEY");
  expect(b.create).not.toHaveBeenCalled();
  expect(b.connect).not.toHaveBeenCalled();
});
it("crea habilitada con cifrado válido aunque el servidor no exista", async () => {
  vi.stubEnv("BBDD_KEYS", JSON.stringify({ v1: Buffer.alloc(32, 7).toString("base64") }));
  vi.stubEnv("BBDD_ACTIVE_KEY", "v1");
  await guardarConexion(null, { ...input, password: "secreto-sintetico" }, 42);
  expect(b.create.mock.calls[0][1]).toMatchObject({ host: input.host, habilitado: 1, clave_version: "v1" });
  expect(b.create.mock.calls[0][1]).not.toHaveProperty("password");
  expect(b.connect).not.toHaveBeenCalled();
});
it("una versión obsoleta rechaza la actualización sin sobrescribir el registro", async () => {
  b.update.mockResolvedValue({ count: 0 });
  await expect(guardarConexion(uuid, input, 42, 6)).rejects.toMatchObject({ statusCode: 409 });
});
