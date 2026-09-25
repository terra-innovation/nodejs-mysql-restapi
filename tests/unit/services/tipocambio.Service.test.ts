import { parseFechaLima, generateCode } from "#root/src/services/tipocambio.Service.js";

describe("tipocambio.Service - Unit Tests", () => {
  describe("parseFechaLima", () => {
    it("debe convertir una fecha YYYY-MM-DD a objeto Date en medianoche UTC", () => {
      const fechaStr = "2026-09-24";
      const result = parseFechaLima(fechaStr);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2026);
      expect(result.getUTCMonth()).toBe(8); // Septiembre es mes 8 (0-indexed)
      expect(result.getUTCDate()).toBe(24);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
    });

    it("debe retornar la fecha actual en medianoche UTC si no se pasa argumento", () => {
      const result = parseFechaLima();
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
    });
  });

  describe("generateCode", () => {
    it("debe generar un código de longitud 8 caracteres alfanuméricos", () => {
      const code = generateCode();
      expect(typeof code).toBe("string");
      expect(code.length).toBe(8);
    });
  });
});
