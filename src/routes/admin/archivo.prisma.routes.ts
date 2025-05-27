import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as archivoController from "#src/controllers/admin/archivo.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";
import * as archivoMiddleware from "#src/middlewares/archivo.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/admin/archivo/listar", verifyToken, checkRole([2]), catchedAsync(archivoController.getArchivos));
//router.post("/admin/archivo/crear", verifyToken, checkRole([2]), catchedAsync(archivoController.createArchivo));
router.patch("/admin/archivo/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.updateArchivo));
router.get("/admin/archivo/master", verifyToken, checkRole([2]), catchedAsync(archivoController.getArchivoMaster));
router.delete("/admin/archivo/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.deleteArchivo));
router.patch("/admin/archivo/activar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.activateArchivo));

router.get("/admin/archivo/descargar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.descargarArchivo));

router.post("/admin/archivo/cargar", verifyToken, checkRole([2]), archivoMiddleware.upload, catchedAsync(archivoController.cargarArchivo));
export default router;
