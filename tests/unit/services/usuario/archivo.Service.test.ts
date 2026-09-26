import { ClientError } from "#src/utils/CustomErrors.js";

// Mocking logger to prevent config.ts process.exit(1)
jest.mock("#src/utils/logger.pino.js", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  line: jest.fn().mockReturnValue(""),
}));

// Mocking prismaFT
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: {
    client: {
      $transaction: jest.fn(async (cb) => cb({})),
    },
    transactionTimeout: 5000,
  },
}));

// Mocking DAOs
jest.mock("#root/src/daos/archivo.Dao.js", () => ({
  getArchivoByArchivoid: jest.fn(),
  insertArchivo: jest.fn(),
  deleteArchivo: jest.fn(),
}));

jest.mock("#root/src/daos/archivotipo.Dao.js", () => ({
  getArchivotipoByCode: jest.fn(),
  getArchivotipoByIdarchivotipo: jest.fn(),
}));

// Mocking fs and fs/promises
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));


import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivotipoDao from "#root/src/daos/archivotipo.Dao.js";
import { fileTypeFromFile } from "file-type";
import * as fs from "fs";
import { unlink } from "fs/promises";
import {
  cargarArchivoService,
  deleteArchivoService,
  getRutaDescargaArchivoService,
} from "#root/src/services/usuario/archivo.Service.js";

describe("usuario/archivo.Service - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("cargarArchivoService", () => {
    const mockArchivoRaw = {
      path: "/tmp/testfile-123.pdf",
      size: 1024 * 1024, // 1MB
      originalname: "contrato.pdf",
      mimetype: "application/pdf",
      anio_upload: "2026",
      mes_upload: "09",
      dia_upload: "25",
      filename: "stored-contrato.pdf",
      encoding: "7bit",
      codigo_archivo: "ARC001",
    };

    const mockArchivotipo = {
      idarchivotipo: 1,
      nombre: "Documento PDF",
      tamanio_maximo: 5 * 1024 * 1024, // 5MB
      extensiones_permitidas: ".pdf,.docx",
      mimetypes_permitidos: "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    it("debe cargar y registrar exitosamente un archivo válido", async () => {
      (archivotipoDao.getArchivotipoByCode as jest.Mock).mockResolvedValue(mockArchivotipo);
      (fileTypeFromFile as jest.Mock).mockResolvedValue({ mime: "application/pdf", ext: "pdf" });
      (archivoDao.insertArchivo as jest.Mock).mockResolvedValue({ archivoid: "uuid-archivo-123" });

      const result = await cargarArchivoService({
        archivoRaw: mockArchivoRaw,
        idusuario: 42,
        archivotipo_code: "DOC_PDF",
      });

      expect(result).toEqual({ archivoid: "uuid-archivo-123" });
      expect(fs.copyFileSync).toHaveBeenCalled();
      expect(unlink).toHaveBeenCalledWith(mockArchivoRaw.path);
      expect(archivoDao.insertArchivo).toHaveBeenCalled();
    });

    it("debe rechazar archivo si excede el tamaño máximo permitido", async () => {
      (archivotipoDao.getArchivotipoByCode as jest.Mock).mockResolvedValue({
        ...mockArchivotipo,
        tamanio_maximo: 500 * 1024, // 500KB
      });

      await expect(
        cargarArchivoService({
          archivoRaw: mockArchivoRaw, // 1MB
          idusuario: 42,
          archivotipo_code: "DOC_PDF",
        }),
      ).rejects.toThrow(ClientError);
    });

    it("debe rechazar archivo si la extensión no está en las permitidas", async () => {
      (archivotipoDao.getArchivotipoByCode as jest.Mock).mockResolvedValue({
        ...mockArchivotipo,
        extensiones_permitidas: ".jpg,.png",
      });

      await expect(
        cargarArchivoService({
          archivoRaw: mockArchivoRaw, // .pdf
          idusuario: 42,
          archivotipo_code: "DOC_PDF",
        }),
      ).rejects.toThrow(ClientError);
    });

    it("debe rechazar si el mimetype real detectado no coincide con los permitidos", async () => {
      (archivotipoDao.getArchivotipoByCode as jest.Mock).mockResolvedValue(mockArchivotipo);
      // Simula que en realidad es un ejecutable disfrazado de pdf
      (fileTypeFromFile as jest.Mock).mockResolvedValue({ mime: "application/x-dsexec", ext: "exe" });

      await expect(
        cargarArchivoService({
          archivoRaw: mockArchivoRaw,
          idusuario: 42,
          archivotipo_code: "DOC_PDF",
        }),
      ).rejects.toThrow(ClientError);
    });
  });

  describe("getRutaDescargaArchivoService", () => {
    it("debe retornar la ruta absoluta para un archivo existente", async () => {
      (archivoDao.getArchivoByArchivoid as jest.Mock).mockResolvedValue({
        idarchivo: 1,
        ruta: "2026/09/25",
        nombrealmacenamiento: "stored-contrato.pdf",
      });

      const ruta = await getRutaDescargaArchivoService({
        archivoid: "uuid-archivo-123",
      });

      expect(typeof ruta).toBe("string");
      expect(ruta).toContain("stored-contrato.pdf");
    });

    it("debe arrojar 404 si el archivo no existe", async () => {
      (archivoDao.getArchivoByArchivoid as jest.Mock).mockResolvedValue(null);

      await expect(
        getRutaDescargaArchivoService({
          archivoid: "uuid-inexistente",
        }),
      ).rejects.toThrow(ClientError);
    });
  });

  describe("deleteArchivoService", () => {
    it("debe eliminar el archivo llamando al DAO correspondiente", async () => {
      (archivoDao.getArchivoByArchivoid as jest.Mock).mockResolvedValue({
        idarchivo: 1,
        archivoid: "uuid-archivo-123",
      });
      (archivoDao.deleteArchivo as jest.Mock).mockResolvedValue([1]);

      const result = await deleteArchivoService({
        archivoid: "uuid-archivo-123",
        idusuario: 42,
      });

      expect(result).toEqual({});
      expect(archivoDao.deleteArchivo).toHaveBeenCalledWith(expect.anything(), "uuid-archivo-123", 42);
    });

    it("debe arrojar 404 si el archivo a eliminar no existe", async () => {
      (archivoDao.getArchivoByArchivoid as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteArchivoService({
          archivoid: "uuid-no-existe",
          idusuario: 42,
        }),
      ).rejects.toThrow(ClientError);
    });
  });
});
