import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
//import * as zlaboratorioController from "#src/controllers/admin/zlaboratorio.prisma.Controller.js";

import * as zlaboratorioController from "#src/controllers/admin/zlaboratorio.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin

router.post("/admin/zlaboratorio/validate/transaction", isAuth, isRole([2]), catchedAsync(zlaboratorioController.validateTransaction));

//router.get("/admin/zlaboratorio/listar", isAuth, isRole([2]), catchedAsync(zlaboratorioController.getEmpresas));
//router.post("/admin/zlaboratorio/crear", isAuth, isRole([2]), catchedAsync(zlaboratorioController.createEmpresa));
//router.patch("/admin/zlaboratorio/actualizar/:id", isAuth, isRole([2]), catchedAsync(zlaboratorioController.updateEmpresa));
//router.get("/admin/zlaboratorio/master", isAuth, isRole([2]), catchedAsync(zlaboratorioController.getEmpresaMaster));
//router.delete("/admin/zlaboratorio/eliminar/:id", isAuth, isRole([2]), catchedAsync(zlaboratorioController.deleteEmpresa));
//router.patch("/admin/zlaboratorio/activar/:id", isAuth, isRole([2]), catchedAsync(zlaboratorioController.activateEmpresa));

export default router;
