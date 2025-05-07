import * as fs from "fs";
import * as luxon from "luxon";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger, { line, log } from "#src/utils/logger.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { ArchivoError } from "#src/utils/CustomErrors.js";

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

export const upload_persona = multer({
  storage: storage_usuarioservicio,
  limits: {
    fileSize: 5 * 1024 * 1024, // Para formularios multiparte, el tamaño máximo de los archivos (en bytes)
    files: 1, // Para los formularios multiparte, el número máximo de campos para archivos
    fieldSize: 0.5 * 1024 * 1024, //Tamaño máximo de los valores para cada campo (en bytes)
    fields: 8, // Número máximo de campos que no son archivos
  },
  fileFilter: async function (req, file, cb) {
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!validImageTypes.includes(file.mimetype)) {
      log.error(line(), `Formato de archivo inválido [${file.mimetype}] en archivo [${file.originalname}]. Tipos permitidos: ${validImageTypes.join(", ")}`);
      return cb(new ArchivoError("Archivo no permitido", 400));
    }
    cb(null, true);
  },
}).fields([{ name: "encabezado_cuenta_bancaria", maxCount: 1 }]);

// Middleware de multer para manejar la subida de archivos
export const upload = (req, res, next) => {
  upload_persona(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      log.error(line(), err);
      return next(new ArchivoError("Datos no válidos", 400));
    }
    if (err instanceof ArchivoError) {
      log.debug(line(), "", err);
      return next(err);
    } else if (err) {
      log.error(line(), err);
      return next(new ArchivoError("Ocurrio un error", 500));
    }

    next(); // Llamar a next() para continuar con la ejecución de la siguiente función middleware
  });
};
