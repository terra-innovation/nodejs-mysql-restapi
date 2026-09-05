import * as archivoController from "#root/src/controllers/usuario/archivo.Controller.js";
import * as archivoMiddleware from "#root/src/middlewares/archivoMiddleware.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

router.delete("/usuario/archivo/eliminar/:id", isAuth, isRole([5]), catchedAsync(archivoController.deleteArchivo));
router.post("/usuario/archivo/cargar", isAuth, isRole([5]), archivoMiddleware.upload, catchedAsync(archivoController.cargarArchivo));

router.get("/usuario/archivo/descargar/:id", isAuth, isRole([5]), catchedAsync(archivoController.descargarArchivo));

export default router;
