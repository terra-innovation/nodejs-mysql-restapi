import { afterEach, beforeEach, describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import fs from "node:fs";
import path from "node:path";
import { upload } from "#src/middlewares/archivoMiddleware.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

describe("Middleware upload (Multer 2.4.0)", () => {
  const app = express();
  const subidosParaLimpiar: string[] = [];

  app.post("/test-upload", upload, (req, res) => {
    const file = req.files && !Array.isArray(req.files) ? req.files.archivo?.[0] : undefined;
    if (file?.path) {
      subidosParaLimpiar.push(file.path);
    }
    res.status(200).json({
      error: false,
      originalname: file?.originalname,
      codigo_archivo: file?.codigo_archivo,
      extension: file?.extension,
    });
  });

  app.use(errorHandlerMiddleware);

  afterEach(() => {
    while (subidosParaLimpiar.length > 0) {
      const p = subidosParaLimpiar.pop();
      if (p && fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {
          // ignorar limpieza
        }
      }
    }
  });

  it("sube un archivo válido de texto sin firma", async () => {
    const response = await request(app)
      .post("/test-upload")
      .attach("archivo", Buffer.from("contenido de prueba"), "documento.txt")
      .expect(200);

    expect(response.body).toMatchObject({
      error: false,
      originalname: "documento.txt",
      extension: "txt",
    });
    expect(response.body.codigo_archivo).toBeDefined();
  });

  it("rechaza si no se adjunta ningún archivo", async () => {
    const response = await request(app)
      .post("/test-upload")
      .expect(400);

    expect(response.body).toMatchObject({
      error: true,
      message: "Archivo es requerido",
    });
  });

  it("rechaza archivos con extensiones no permitidas (.exe)", async () => {
    const response = await request(app)
      .post("/test-upload")
      .attach("archivo", Buffer.from("fake binary"), "malware.exe")
      .expect(400);

    expect(response.body).toMatchObject({
      error: true,
      message: "Archivo no permitido",
    });
  });
});
