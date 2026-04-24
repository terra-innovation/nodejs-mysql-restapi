import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as archivoController from "#root/src/controllers/usuario/archivo.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as archivoMiddleware from "#root/src/middlewares/archivoMiddleware.js";

const router = Router();

router.delete("/usuario/archivo/eliminar/:id", isAuth, isRole([5]), catchedAsync(archivoController.deleteArchivo));
router.post("/usuario/archivo/cargar", isAuth, isRole([5]), archivoMiddleware.upload, catchedAsync(archivoController.cargarArchivo));

router.get("/usuario/archivo/descargar/:id", isAuth, isRole([5]), catchedAsync(archivoController.descargarArchivo));

export default router;
