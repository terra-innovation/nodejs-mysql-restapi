import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { cifrarPassword, descifrarPassword } from "#src/providers/bbdd/bbddCrypto.js";
const uuid = "00000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.stubEnv("BANK_SYNC_KEYS", JSON.stringify({ v1: randomBytes(32).toString("base64"), v2: randomBytes(32).toString("base64") }));
  vi.stubEnv("BANK_SYNC_ACTIVE_KEY", "v1");
});
afterEach(() => vi.unstubAllEnvs());
it("autentica secreto y genera nonce distinto por cifrado", () => {
  const a = cifrarPassword("sintético-contraseña", uuid),
    b = cifrarPassword("sintético-contraseña", uuid);
  expect(descifrarPassword(a, uuid)).toBe("sintético-contraseña");
  expect(a.password_nonce).toHaveLength(12);
  expect(a.password_tag).toHaveLength(16);
  expect(a.password_nonce).not.toEqual(b.password_nonce);
  expect(Buffer.from(a.password_cifrado).toString("utf8")).not.toContain("contraseña");
});
it.each(["password_cifrado", "password_nonce", "password_tag"] as const)("rechaza alteración de %s", (field) => {
  const a = cifrarPassword("dato-sintético", uuid);
  a[field][0] ^= 1;
  expect(() => descifrarPassword(a, uuid)).toThrow("autenticar");
});
it("AAD impide trasladar secreto a otra conexión o versión de clave", () => {
  const a = cifrarPassword("dato-sintético", uuid);
  expect(() => descifrarPassword(a, "00000000-0000-4000-8000-000000000002")).toThrow();
  expect(() => descifrarPassword({ ...a, clave_version: "v2" }, uuid)).toThrow();
});
it("rotación usa otra clave sin invalidar descifrado del formato anterior", () => {
  const a = cifrarPassword("antes", uuid);
  vi.stubEnv("BANK_SYNC_ACTIVE_KEY", "v2");
  const b = cifrarPassword("después", uuid);
  expect(descifrarPassword(a, uuid)).toBe("antes");
  expect(descifrarPassword(b, uuid)).toBe("después");
  expect(b.clave_version).toBe("v2");
});
it("no usa clave de correo como fallback", () => {
  vi.stubEnv("BANK_SYNC_KEYS", "{}");
  expect(() => cifrarPassword("dato-sintético", uuid)).toThrow("BBDD_KEYS");
});
it("variables genéricas descifran el sobre anterior después del renombre sin recifrar", () => {
  const legacy = cifrarPassword("secreto-anterior", uuid);
  vi.stubEnv("BBDD_KEYS", process.env.BANK_SYNC_KEYS!);
  vi.stubEnv("BBDD_ACTIVE_KEY", "v1");
  vi.stubEnv("BANK_SYNC_KEYS", "{}");
  expect(descifrarPassword(legacy, uuid)).toBe("secreto-anterior");
  vi.stubEnv("BBDD_KEYS", "{}");
  expect(() => descifrarPassword(legacy, uuid)).toThrow("BBDD_KEYS");
});
