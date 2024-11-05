import * as jsonUtils from "../utils/jsonUtils.js";
import multer from "multer";
import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as storageUtils from "../utils/storageUtils.js";

let storage_persona = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageUtils.STORAGE_PATH_PROCESAR);
  },
  filename: (req, file, cb) => {
    //console.log(file);
    const codigo_archivo = uuidv4().split("-")[0] + "-" + uuidv4().split("-")[1];
    const uniqueSuffix = luxon.DateTime.now().toFormat("yyyyMMdd_HHmmss_SSS") + "_" + codigo_archivo;
    const filename = uniqueSuffix + "_" + file.originalname;
    cb(null, filename);
    file.codigo_archivo = codigo_archivo;
  },
});

export const upload_persona = multer({
  storage: storage_persona,
  limits: {
    fileSize: 5 * 1024 * 1024, // Para formularios multiparte, el tamaño máximo de los archivos (en bytes)
    files: 3, // Para los formularios multiparte, el número máximo de campos para archivos
    fieldSize: 0.5 * 1024 * 1024, //Tamaño máximo de los valores para cada campo (en bytes)
    fields: 15, // Número máximo de campos que no son archivos
  },
  fileFilter: async function (req, file, cb) {
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validImageTypes.includes(file.mimetype)) {
      cb(new Error(`Formato de archivo inválido [${file.mimetype}]. Tipos permitidos: ${validImageTypes.join(", ")}`));
    }
    cb(null, true);
  },
}).fields([
  { name: "identificacion_anverso", maxCount: 1 },
  { name: "identificacion_reservo", maxCount: 1 },
  { name: "identificacion_selfi", maxCount: 1 },
]);

// Middleware de multer para manejar la subida de archivos
export const upload = (req, res, next) => {
  upload_persona(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error(err);
      return res.status(404).send({ error: true, message: "Datos no válidos" });
    } else if (err) {
      console.error(err);
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: true, message: "Ocurrio un error" });
    }

    next(); // Llamar a next() para continuar con la ejecución de la siguiente función middleware
  });
};
