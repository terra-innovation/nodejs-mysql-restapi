import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as pagadorlimiteController from "#src/controllers/admin/pagadorlimite.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

// Pagador Limite
router.get("/admin/pagadorlimite/listar", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.getPagadorlimites));
router.post("/admin/pagadorlimite/crear", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.createPagadorlimite));
router.patch("/admin/pagadorlimite/actualizar/:id", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.updatePagadorlimite));
router.get("/admin/pagadorlimite/master", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.getPagadorlimiteMaster));
router.delete("/admin/pagadorlimite/eliminar/:id", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.deletePagadorlimite));
router.patch("/admin/pagadorlimite/activar/:id", isAuth, isRole([2]), catchedAsync(pagadorlimiteController.activatePagadorlimite));

export default router;
