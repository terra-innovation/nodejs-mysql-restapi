import { describe, expect, it } from "vitest";
import { fileTypeFromBuffer } from "file-type";

describe("Compatibilidad ESM con file-type real", () => {
  it("reconoce un PNG por contenido binario", async () => {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf9kAAAAASUVORK5CYII=", "base64");
    expect(await fileTypeFromBuffer(png)).toEqual({ ext: "png", mime: "image/png" });
  });

  it("no clasifica texto arbitrario como imagen", async () => {
    expect(await fileTypeFromBuffer(Buffer.from("contenido de prueba sin firma de imagen"))).toBeUndefined();
  });
});
