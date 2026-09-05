import * as cedentelimiteController from "#root/src/controllers/admin/cedentelimite.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

// Cedente Limite
router.get("/admin/cedentelimite/listar", isAuth, isRole([2]), catchedAsync(cedentelimiteController.getCedentelimites));
router.post("/admin/cedentelimite/crear", isAuth, isRole([2]), catchedAsync(cedentelimiteController.createCedentelimite));
router.patch("/admin/cedentelimite/actualizar/:id", isAuth, isRole([2]), catchedAsync(cedentelimiteController.updateCedentelimite));
router.get("/admin/cedentelimite/master", isAuth, isRole([2]), catchedAsync(cedentelimiteController.getCedentelimiteMaster));
router.delete("/admin/cedentelimite/eliminar/:id", isAuth, isRole([2]), catchedAsync(cedentelimiteController.deleteCedentelimite));
router.patch("/admin/cedentelimite/activar/:id", isAuth, isRole([2]), catchedAsync(cedentelimiteController.activateCedentelimite));

export default router;
