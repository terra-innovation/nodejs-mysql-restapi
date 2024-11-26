import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as archivoController from "../../controllers/admin/archivoController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Usuario
router.get("/admin/archivo/listar", verifyToken, checkRole([2]), catchedAsync(archivoController.getArchivos));
//router.post("/admin/archivo/crear", verifyToken, checkRole([2]), catchedAsync(archivoController.createArchivo));
router.patch("/admin/archivo/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.updateArchivo));
router.get("/admin/archivo/master", verifyToken, checkRole([2]), catchedAsync(archivoController.getArchivoMaster));
router.delete("/admin/archivo/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.deleteArchivo));
router.patch("/admin/archivo/activar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.activateArchivo));

router.get("/admin/archivo/descargar/:id", verifyToken, checkRole([2]), catchedAsync(archivoController.descargarArchivo));
export default router;
