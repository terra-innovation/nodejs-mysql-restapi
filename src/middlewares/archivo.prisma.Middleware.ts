import * as fs from "fs";
import * as luxon from "luxon";
import multer, { Multer, FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { log, line } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { fileTypeFromFile } from "file-type";
import { ArchivoError } from "#src/utils/CustomErrors.js";
import type { Request, Response, NextFunction } from "express";

// Extensiones o mimetypes peligrosos comúnmente bloqueados
const EXTENSIONES_NO_PERMITIDAS: string[] = [".exe", ".bat", ".cmd", ".sh", ".bash", ".msi", ".apk", ".bin", ".dll", ".scr", ".com", ".pif", ".vbs", ".wsf", ".jar", ".py", ".rb", ".php", ".pl"];

const MIMETYPES_NO_PERMITIDOS: string[] = [
  "application/x-msdownload", // .exe
  "application/x-msdos-program", // .bat, .cmd
  "application/x-sh", // .sh
  "application/x-bash", // .bash
  "application/x-msi", // .msi
  "application/java-archive", // .jar
  "application/x-dosexec", // .exe en algunos sistemas
  "application/x-executable", // binarios genéricos
  "text/x-python", // .py
  "text/x-script.python",
  "text/x-php", // .php
  "text/x-shellscript", // .sh, .bash
  "application/x-python-code",
];

const EXTENSIONES_SIN_FIRMA_PERMITIDAS: string[] = [".csv", ".txt", ".log", ".md", ".json", ".xml", ".yml", ".yaml", ".tsv"];

let storage_usuarioservicio = multer.diskStorage({
  destination: (req: Request, file: Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const anio_upload = luxon.DateTime.now().toFormat("yyyy");
    const mes_upload = luxon.DateTime.now().toFormat("MM");
    const dia_upload = luxon.DateTime.now().toFormat("dd");
    const rutaDestino = path.join(storageUtils.STORAGE_PATH_PROCESAR, anio_upload, mes_upload, dia_upload);
    const rutaDestinoFake = path.join(storageUtils.STORAGE_PATH_PROCESAR, anio_upload, mes_upload, dia_upload, "file.fake");
    fs.mkdirSync(path.dirname(rutaDestinoFake), { recursive: true });

    cb(null, rutaDestino);
  },
  filename: (req: Request, file: Multer.File, cb: (error: Error | null, filename: string) => void) => {
    //log.info(line(),file);
    const extension = path.extname(file.originalname).slice(1) || "";
    const anio_upload = luxon.DateTime.now().toFormat("yyyy");
    const mes_upload = luxon.DateTime.now().toFormat("MM");
    const dia_upload = luxon.DateTime.now().toFormat("dd");
    const codigo_archivo = uuidv4().split("-")[0] + "-" + uuidv4().split("-")[1];
    const uniqueSuffix = luxon.DateTime.now().toFormat("yyyyMMdd_HHmmss_SSS") + "_" + codigo_archivo;
    const filename = uniqueSuffix + "_" + file.originalname;
    cb(null, filename);
    file.codigo_archivo = codigo_archivo;
    file.extension = extension;
    file.anio_upload = anio_upload;
    file.mes_upload = mes_upload;
    file.dia_upload = dia_upload;
  },
});

export const upload_archivo = multer({
  storage: storage_usuarioservicio,
  limits: {
    fileSize: 5 * 1024 * 1024, // Para formularios multiparte, el tamaño máximo de los archivos (en bytes)
    files: 1, // Para los formularios multiparte, el número máximo de campos para archivos
    fieldSize: 0.5 * 1024 * 1024, //Tamaño máximo de los valores para cada campo (en bytes)
    fields: 1, // Número máximo de campos que no son archivos
  },
  fileFilter: async function (req: Request, file: Multer.File, cb: FileFilterCallback) {
    // Seguridad básica
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (EXTENSIONES_NO_PERMITIDAS.includes(ext)) {
      log.error(line(), `Extensión de archivo no permitida: [${ext}] en archivo [${file.originalname}]`);
      return cb(new ArchivoError("Archivo no permitido", 400));
    }

    if (MIMETYPES_NO_PERMITIDOS.includes(mime)) {
      log.error(line(), `Tipo de archivo no permitido: [${mime}] en archivo [${file.originalname}]`);
      return cb(new ArchivoError("Archivo no permitido", 400));
    }

    cb(null, true);
  },
}).fields([{ name: "archivo", maxCount: 1 }]);

// Middleware de multer para manejar la subida de archivos
export const upload = (req: Request, res: Response, next: NextFunction) => {
  upload_archivo(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      log.error(line(), err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ArchivoError("Archivo demasiado grande", 400));
      } else {
        return next(new ArchivoError("Datos no válidos", 400));
      }
    }
    if (err instanceof ArchivoError) {
      log.error(line(), "", err);
      return next(err);
    } else if (err) {
      log.error(line(), err);
      return next(new ArchivoError("Ocurrio un error", 500));
    }

    // Seguridad avanzada
    // Revisa el minetype real del archivo
    let file: Multer.file | undefined;
    if (req.files && !Array.isArray(req.files) && "archivo" in req.files) {
      file = req.files.archivo?.[0];
    }
    if (!file) {
      log.error(line(), `No se proporcionó ningún archivo`);
      return next(new ArchivoError("Archivo es requerido", 400));
    }
    try {
      const filePath = file.path;
      const tipoDetectado = await fileTypeFromFile(filePath);

      const ext = path.extname(file.originalname).toLowerCase();
      if (EXTENSIONES_NO_PERMITIDAS.includes(ext)) {
        fs.unlinkSync(filePath);
        log.error(line(), `Extensión de archivo no permitida: [${ext}] en archivo [${file.originalname}]`);
        return next(new ArchivoError("Archivo no permitido", 400));
      }

      if (!tipoDetectado) {
        // Si no se pudo detectar el tipo real, validamos la extensión
        if (!EXTENSIONES_SIN_FIRMA_PERMITIDAS.includes(ext)) {
          fs.unlinkSync(filePath);
          log.error(line(), `No se pudo determinar el tipo real del archivo en [${file.originalname}] y la extensión [${ext}] no está permitida`);
          return next(new ArchivoError("Archivo no permitido", 400));
        }

        // Extensión aceptada sin firma
        log.debug(line(), `Archivo aceptado sin firma: ${file.originalname}, extensión: ${ext}`);
        return next();
      }

      if (MIMETYPES_NO_PERMITIDOS.includes(tipoDetectado.mime)) {
        fs.unlinkSync(filePath);
        log.error(line(), `Tipo de archivo no permitido: [${tipoDetectado.mime}] en archivo [${file.originalname}]`);
        return next(new ArchivoError("Archivo no permitido", 400));
      }

      log.debug(line(), `Archivo aceptado: ${file.originalname}, tipo real: ${tipoDetectado.mime}`);
      next();
    } catch (err) {
      log.error(line(), err);
      return next(new ArchivoError("Ocurrio un error", 500));
    }
  });
};
