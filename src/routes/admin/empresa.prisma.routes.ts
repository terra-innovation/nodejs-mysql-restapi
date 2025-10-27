import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresaController from "#src/controllers/admin/empresa.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/empresa/listar", isAuth, isRole([2]), catchedAsync(empresaController.getEmpresas));
router.post("/admin/empresa/crear", isAuth, isRole([2]), catchedAsync(empresaController.createEmpresa));
router.patch("/admin/empresa/actualizar/:id", isAuth, isRole([2]), catchedAsync(empresaController.updateEmpresa));
router.get("/admin/empresa/master", isAuth, isRole([2]), catchedAsync(empresaController.getEmpresaMaster));
router.delete("/admin/empresa/eliminar/:id", isAuth, isRole([2]), catchedAsync(empresaController.deleteEmpresa));
router.patch("/admin/empresa/activar/:id", isAuth, isRole([2]), catchedAsync(empresaController.activateEmpresa));

export default router;
