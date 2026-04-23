import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as archivoController from "#src/controllers/empresario/archivo.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as archivoMiddleware from "#root/src/middlewares/archivoMiddleware.js";

const router = Router();

router.post("/empresario/archivo/cargar", isAuth, isRole([2]), archivoMiddleware.upload, catchedAsync(archivoController.cargarArchivo));

export default router;
