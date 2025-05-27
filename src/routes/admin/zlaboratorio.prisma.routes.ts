import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
//import * as zlaboratorioController from "#src/controllers/admin/zlaboratorioController.js";

import * as zlaboratorioController from "#src/controllers/admin/zlaboratorio.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Admin

router.post("/admin/zlaboratorio/validate/transaction", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.validateTransaction));

//router.get("/admin/zlaboratorio/listar", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.getEmpresas));
//router.post("/admin/zlaboratorio/crear", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.createEmpresa));
//router.patch("/admin/zlaboratorio/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.updateEmpresa));
//router.get("/admin/zlaboratorio/master", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.getEmpresaMaster));
//router.delete("/admin/zlaboratorio/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.deleteEmpresa));
//router.patch("/admin/zlaboratorio/activar/:id", verifyToken, checkRole([2]), catchedAsync(zlaboratorioController.activateEmpresa));

export default router;
