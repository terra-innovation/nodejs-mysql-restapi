import * as jsonUtils from "../utils/jsonUtils.js";
import multer from "multer";
import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as storageUtils from "../utils/storageUtils.js";
import logger, { line } from "../utils/logger.js";

let storage_invoice = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageUtils.STORAGE_PATH_PROCESAR);
  },
  filename: (req, file, cb) => {
    //logger.info(line(),file);
    const codigo_archivo = uuidv4().split("-")[0] + "-" + uuidv4().split("-")[1];
    const uniqueSuffix = luxon.DateTime.now().toFormat("yyyyMMdd_HHmmss_SSS") + "_" + codigo_archivo;
    const filename = uniqueSuffix + "_" + file.originalname;
    cb(null, filename);
    file.codigo_archivo = codigo_archivo;
  },
});

export const upload_invoice = multer({
  storage: storage_invoice,
  limits: { fileSize: 2 * 1024 * 1024, files: 5, fields: 10 },
  fileFilter: async function (req, file, cb) {
    //logger.info(line(),"fileFilter");
    //logger.info(line(),"file.mimetype: " + file.mimetype);
    if (file.mimetype !== "text/xml" && file.mimetype !== "application/xml") {
      cb(new Error("Formato de archivo inválido"));
    }
    cb(null, true);
  },
}).array("invoice", 1);

// Middleware de multer para manejar la subida de archivos
export const upload = (req, res, next) => {
  upload_invoice(req, res, function (err) {
    logger.error(line(), err);
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(404).send({ error: true, message: "El archivo supera el máximo tamaño permitido de 2 MB" });
      } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
        return res.status(404).send({ error: true, message: "El máximo de archivos a cargar es 1" });
      } else {
        logger.error(line(), err);
        return res.status(404).send({ error: true, message: "El archivo no fue posible cargar" });
      }
    } else if (err) {
      logger.error(line(), err);
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: true, message: err.message });
    } else if (!req.files) {
      // FILE NOT SELECTED
      return res.status(404).json({ error: true, message: "El archivo es requerido" });
    }
    next(); // Llamar a next() para continuar con la ejecución de la siguiente función middleware
  });
};
