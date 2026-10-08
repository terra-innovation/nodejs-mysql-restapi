import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const h = vi.hoisted(() => ({
  transaction: vi.fn(), getType: vi.fn(), getDefaultType: vi.fn(), insert: vi.fn(), get: vi.fn(), remove: vi.fn(),
  root: "", success: "",
}));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: h.transaction }, transactionTimeout: 5000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/daos/archivo.Dao.js", () => ({ insertArchivo: h.insert, getArchivoByArchivoid: h.get, deleteArchivo: h.remove }));
vi.mock("#src/daos/archivotipo.Dao.js", () => ({ getArchivotipoByCode: h.getType, getArchivotipoByIdarchivotipo: h.getDefaultType }));
vi.mock("#src/utils/storageUtils.js", () => ({
  get STORAGE_PATH_SUCCESS() { return h.success; },
  pathApp: () => h.root,
  normalizarRuta: (value: string) => value.replace(/[\\/]/g, path.sep),
}));

import { cargarArchivoService, deleteArchivoService, getRutaDescargaArchivoService } from "#src/services/usuario/archivo.Service.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf9kAAAAASUVORK5CYII=", "base64");
let tx: { testTransaction: boolean };
const fileDto = (content = png) => {
  const origin = path.join(h.root, "upload.tmp");
  writeFileSync(origin, content);
  return { idusuario: 42, archivotipo_code: "fixture-image", archivoRaw: {
    path: origin, size: content.length, originalname: "documento.PNG", mimetype: "image/png",
    anio_upload: "2026", mes_upload: "10", dia_upload: "07", filename: "stored.png", encoding: "7bit", codigo_archivo: "fixture-code",
  } };
};
const destination = () => path.join(h.success, "2026", "10", "07", "stored.png");

beforeEach(() => {
  vi.resetAllMocks();
  h.root = mkdtempSync(path.join(tmpdir(), "ft-vitest-archivo-"));
  h.success = path.join(h.root, "success");
  tx = { testTransaction: true };
  h.transaction.mockImplementation(async (callback) => callback(tx));
  const type = { idarchivotipo: 10, nombre: "imagen fixture", tamanio_maximo: png.length, extensiones_permitidas: ".png, .jpg", mimetypes_permitidos: "image/png,image/jpeg" };
  h.getType.mockResolvedValue(type);
  h.getDefaultType.mockResolvedValue(type);
  h.insert.mockResolvedValue({ archivoid: "file-test" });
  h.get.mockResolvedValue({ archivoid: "file-test", ruta: "2026/10/07", nombrealmacenamiento: "stored.png" });
  h.remove.mockResolvedValue([1]);
});
afterEach(() => {
  const cleanupRoot = path.resolve(h.root);
  if (path.dirname(cleanupRoot) !== path.resolve(tmpdir()) || !path.basename(cleanupRoot).startsWith("ft-vitest-archivo-")) {
    throw new Error("La limpieza solo puede eliminar la carpeta temporal propia de la prueba");
  }
  rmSync(cleanupRoot, { recursive: true, force: true });
});

describe("Carga de archivos con filesystem y detección MIME reales", () => {
  it("acepta el tamaño máximo exacto, normaliza extensión y elimina el temporal", async () => {
    const dto = fileDto();
    await expect(cargarArchivoService(dto)).resolves.toEqual({ archivoid: "file-test" });
    expect(existsSync(dto.archivoRaw.path)).toBe(false);
    expect(readFileSync(destination())).toEqual(png);
    expect(h.insert).toHaveBeenCalledWith(tx, expect.objectContaining({ idusuariocrea: 42, idusuariomod: 42, mimetype: "image/png", extension: "png", tamanio: png.length, archivo_tipo: { connect: { idarchivotipo: 10 } } }));
  });
  it("usa el MIME binario real aunque el navegador declare uno diferente", async () => {
    const dto = fileDto();
    dto.archivoRaw.mimetype = "application/pdf";
    await cargarArchivoService(dto);
    expect(h.insert.mock.calls[0][1].mimetype).toBe("image/png");
  });
  it("sin código selecciona el tipo por defecto ID 10", async () => {
    const dto = fileDto();
    delete dto.archivotipo_code;
    await cargarArchivoService(dto);
    expect(h.getDefaultType).toHaveBeenCalledWith(tx, 10);
    expect(h.getType).not.toHaveBeenCalled();
  });
  it.each(["tipo desconocido", "tipo por defecto ausente", "tamaño", "extensión", "contenido"])("rechaza %s, limpia temporal y no registra archivo", async (kind) => {
    const content = kind === "contenido" ? Buffer.from("%PDF-1.4\ncontenido sintético de prueba\n%%EOF") : png;
    const dto = fileDto(content);
    let status = 400;
    if (kind === "tipo desconocido") { h.getType.mockResolvedValue(null); status = 404; }
    if (kind === "tipo por defecto ausente") { delete dto.archivotipo_code; h.getDefaultType.mockResolvedValue(null); status = 500; }
    if (kind === "tamaño") dto.archivoRaw.size = png.length + 1;
    if (kind === "extensión") dto.archivoRaw.originalname = "documento.exe";
    await expect(cargarArchivoService(dto)).rejects.toMatchObject({ statusCode: status });
    expect(h.insert).not.toHaveBeenCalled();
    expect(existsSync(dto.archivoRaw.path)).toBe(false);
    expect(existsSync(destination())).toBe(false);
  });
  it("si falla el registro, propaga el error y limpia el temporal", async () => {
    const dto = fileDto();
    const error = new Error("registro fallido");
    h.insert.mockRejectedValueOnce(error);
    await expect(cargarArchivoService(dto)).rejects.toBe(error);
    expect(existsSync(dto.archivoRaw.path)).toBe(false);
    // La limpieza de la copia final queda como deuda; no se declara rollback del filesystem.
  });
});

describe("Consulta y eliminación lógica de archivos", () => {
  it("devuelve la ruta absoluta del archivo registrado", async () => {
    await expect(getRutaDescargaArchivoService({ archivoid: "file-test" })).resolves.toBe(destination());
    expect(h.get).toHaveBeenCalledWith(tx, "file-test");
  });
  it.each([null, [0]])("archivo no encontrado %s produce 404 en descarga", async (record) => {
    h.get.mockResolvedValue(record);
    await expect(getRutaDescargaArchivoService({ archivoid: "file-test" })).rejects.toMatchObject({ statusCode: 404 });
  });
  it("eliminación delega la identidad y actor sin eliminar físicamente el archivo", async () => {
    const dto = fileDto();
    await cargarArchivoService(dto);
    await expect(deleteArchivoService({ archivoid: "file-test", idusuario: 42 })).resolves.toEqual({});
    expect(h.remove).toHaveBeenCalledWith(tx, "file-test", 42);
    expect(existsSync(destination())).toBe(true);
  });
  it("no elimina lógicamente un registro inexistente", async () => {
    h.get.mockResolvedValue(null);
    await expect(deleteArchivoService({ archivoid: "missing", idusuario: 42 })).rejects.toMatchObject({ statusCode: 404 });
    expect(h.remove).not.toHaveBeenCalled();
  });
});
