import * as empresaController from "#root/src/controllers/admin/empresa.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/empresa/listar", isAuth, isRole([2]), catchedAsync(empresaController.getEmpresas));
router.post("/admin/empresa/crear", isAuth, isRole([2]), catchedAsync(empresaController.createEmpresa));
router.patch("/admin/empresa/actualizar/:id", isAuth, isRole([2]), catchedAsync(empresaController.updateEmpresa));
router.get("/admin/empresa/master", isAuth, isRole([2]), catchedAsync(empresaController.getEmpresaMaster));
router.delete("/admin/empresa/eliminar/:id", isAuth, isRole([2]), catchedAsync(empresaController.deleteEmpresa));
router.patch("/admin/empresa/activar/:id", isAuth, isRole([2]), catchedAsync(empresaController.activateEmpresa));

export default router;
