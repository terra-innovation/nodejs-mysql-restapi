import { describe, expect, it } from "vitest";
import { validateEnvironment } from "../../../scripts/rehearsal/guard.mjs";

const fixture = () => ({ PRISMA_DATABASE_FACTORING_URL: "mysql://ft_lab:synthetic@db:3306/ft_rehearsal", NODE_ENV: "production", PORT: "5000", TELEGRAM_ACTIVE: "false", DECOLECTA_BASE_URL: "http://127.0.0.1:1", APISPERU_BASE_URL: "http://127.0.0.1:1" });

describe("guarda del ensayo Ubuntu", () => {
  it("admite únicamente el destino sintético de la red interna", () => {
    expect(() => validateEnvironment(fixture())).not.toThrow();
  });
  it.each(["mysql://ft_lab:synthetic@127.0.0.1:3306/ft_rehearsal", "mysql://ft_lab:synthetic@external.invalid:3306/ft_rehearsal", "mysql://root:synthetic@db:3306/ft_rehearsal", "mysql://ft_lab:synthetic@db:3306/production", "mysql://ft_lab:synthetic@db:3307/ft_rehearsal", "https://ft_lab:synthetic@db:3306/ft_rehearsal"])("rechaza host, usuario, base, puerto o protocolo ajenos (%#)", (url) => {
    expect(() => validateEnvironment({ ...fixture(), PRISMA_DATABASE_FACTORING_URL: url })).toThrow("Configuración rechazada");
  });
  it.each([{ NODE_ENV: "development" }, { PORT: "5001" }, { TELEGRAM_ACTIVE: "true" }, { DECOLECTA_BASE_URL: "https://external.invalid" }, { APISPERU_BASE_URL: "https://external.invalid" }])("rechaza configuración fuera del ensayo (%#)", (change) => {
    expect(() => validateEnvironment({ ...fixture(), ...change })).toThrow();
  });
  it("no divulga un valor inválido de conexión", () => {
    try {
      validateEnvironment({ ...fixture(), PRISMA_DATABASE_FACTORING_URL: "synthetic-secret-invalid-url" });
      throw new Error("Se aceptó una URL inválida");
    } catch (error) {
      expect(String(error)).toContain("URL de ensayo inválida");
      expect(String(error)).not.toContain("synthetic-secret-invalid-url");
    }
  });
});
