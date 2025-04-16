import * as fs from "fs";
import * as luxon from "luxon";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger, { line } from "#src/utils/logger.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { fileTypeFromFile } from "file-type";
import { ArchivoError } from "#src/utils/CustomErrors.js";

// Extensiones o mimetypes peligrosos comúnmente bloqueados
const EXTENSIONES_NO_PERMITIDAS = [".exe", ".bat", ".cmd", ".sh", ".bash", ".msi", ".apk", ".bin", ".dll", ".scr", ".com", ".pif", ".vbs", ".wsf", ".jar", ".py", ".rb", ".php", ".pl"];

const MIMETYPES_NO_PERMITIDOS = [
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

let storage_usuarioservicio = multer.diskStorage({
  destination: (req, file, cb) => {
    const anio_upload = luxon.DateTime.now().toFormat("yyyy");
    const mes_upload = luxon.DateTime.now().toFormat("MM");
    const dia_upload = luxon.DateTime.now().toFormat("dd");
    const rutaDestino = path.join(storageUtils.STORAGE_PATH_PROCESAR, anio_upload, mes_upload, dia_upload);
    const rutaDestinoFake = path.join(storageUtils.STORAGE_PATH_PROCESAR, anio_upload, mes_upload, dia_upload, "file.fake");
    fs.mkdirSync(path.dirname(rutaDestinoFake), { recursive: true });

    cb(null, rutaDestino);
  },
  filename: (req, file, cb) => {
    //logger.info(line(),file);
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
  fileFilter: async function (req, file, cb) {
    // Seguridad básica
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (EXTENSIONES_NO_PERMITIDAS.includes(ext)) {
      logger.error(line(), `Extensión de archivo no permitida: [${ext}] en archivo [${file.originalname}]`);
      return cb(new ArchivoError("Archivo no permitido", 400));
    }

    if (MIMETYPES_NO_PERMITIDOS.includes(mime)) {
      logger.error(line(), `Tipo de archivo no permitido: [${mime}] en archivo [${file.originalname}]`);
      return cb(new ArchivoError("Archivo no permitido", 400));
    }

    cb(null, true);
  },
}).fields([{ name: "archivo", maxCount: 1 }]);

// Middleware de multer para manejar la subida de archivos
export const upload = (req, res, next) => {
  upload_archivo(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(line(), err);
      return next(new ArchivoError("Datos no válidos", 400));
    }
    if (err instanceof ArchivoError) {
      logger.debug(line(), err);
      return next(err);
    } else if (err) {
      logger.error(line(), err);
      return next(new ArchivoError("Ocurrio un error", 500));
    }

    // Seguridad avanzada
    // Revisa el minetype real del archivo
    const file = req.files?.archivo[0];
    if (!file) {
      logger.error(line(), `No se proporcionó ningún archivo`);
      return next(new ArchivoError("Archivo es requerido", 400));
    }
    try {
      const filePath = file.path;
      const tipoDetectado = await fileTypeFromFile(filePath);

      const ext = path.extname(file.originalname).toLowerCase();
      if (EXTENSIONES_NO_PERMITIDAS.includes(ext)) {
        fs.unlinkSync(filePath);
        logger.error(line(), `Extensión de archivo no permitida: [${ext}] en archivo [${file.originalname}]`);
        return next(new ArchivoError("Archivo no permitido", 400));
      }

      if (!tipoDetectado) {
        fs.unlinkSync(filePath);
        logger.error(line(), `No se pudo determinar el tipo real del archivo en [${file.originalname}]`);
        return next(new ArchivoError("Archivo no permitido", 400));
      }

      if (MIMETYPES_NO_PERMITIDOS.includes(tipoDetectado.mime)) {
        fs.unlinkSync(filePath);
        logger.error(line(), `Tipo de archivo no permitido: [${tipoDetectado.mime}] en archivo [${file.originalname}]`);
        return next(new ArchivoError("Archivo no permitido", 400));
      }

      logger.debug(line(), `Archivo aceptado: ${file.originalname}, tipo real: ${tipoDetectado.mime}`);
      next();
    } catch (err) {
      logger.error(line(), err);
      return next(new ArchivoError("Ocurrio un error", 500));
    }
  });
};
