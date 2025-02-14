import * as fs from "fs";
import * as luxon from "luxon";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger, { line } from "../utils/logger.js";
import * as storageUtils from "../utils/storageUtils.js";

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
      cb(new Error(`Formato de archivo inválido [${file.mimetype}]. Tipos permitidos: ${validImageTypes.join(", ")}`));
    }
    cb(null, true);
  },
}).fields([{ name: "encabezado_cuenta_bancaria", maxCount: 1 }]);

// Middleware de multer para manejar la subida de archivos
export const upload = (req, res, next) => {
  upload_persona(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      logger.error(line(), err);
      return res.status(404).send({ error: true, message: "Datos no válidos" });
    } else if (err) {
      logger.error(line(), err);
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: true, message: "Ocurrio un error" });
    }

    next(); // Llamar a next() para continuar con la ejecución de la siguiente función middleware
  });
};
