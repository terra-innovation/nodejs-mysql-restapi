import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as archivofacturaController from "../../controllers/admin/archivofacturaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
//router.get("/admin/archivofactura/listar", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.getArchivofacturas));
//router.post("/admin/archivofactura/crear", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.createArchivofactura));
//router.patch("/admin/archivofactura/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.updateArchivofactura));
//router.get("/admin/archivofactura/master", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.getArchivofacturaMaster));
//router.delete("/admin/archivofactura/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.deleteArchivofactura));
//router.patch("/admin/archivofactura/activar/:id", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.activateArchivofactura));

router.get("/admin/archivofactura/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.getArchivofacturasByFactoringid));

export default router;
