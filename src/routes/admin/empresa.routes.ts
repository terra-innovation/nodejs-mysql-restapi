import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresaController from "#src/controllers/admin/empresaController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/empresa/listar", verifyToken, checkRole([2]), catchedAsync(empresaController.getEmpresas));
router.post("/admin/empresa/crear", verifyToken, checkRole([2]), catchedAsync(empresaController.createEmpresa));
router.patch("/admin/empresa/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(empresaController.updateEmpresa));
router.get("/admin/empresa/master", verifyToken, checkRole([2]), catchedAsync(empresaController.getEmpresaMaster));
router.delete("/admin/empresa/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(empresaController.deleteEmpresa));
router.patch("/admin/empresa/activar/:id", verifyToken, checkRole([2]), catchedAsync(empresaController.activateEmpresa));

export default router;
