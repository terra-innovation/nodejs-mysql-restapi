import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factorlimiteController from "#src/controllers/admin/factorlimite.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

// Factor Limite
router.get("/admin/factorlimite/listar", isAuth, isRole([2]), catchedAsync(factorlimiteController.getFactorlimites));
router.post("/admin/factorlimite/crear", isAuth, isRole([2]), catchedAsync(factorlimiteController.createFactorlimite));
router.patch("/admin/factorlimite/actualizar/:id", isAuth, isRole([2]), catchedAsync(factorlimiteController.updateFactorlimite));
router.get("/admin/factorlimite/master", isAuth, isRole([2]), catchedAsync(factorlimiteController.getFactorlimiteMaster));
router.delete("/admin/factorlimite/eliminar/:id", isAuth, isRole([2]), catchedAsync(factorlimiteController.deleteFactorlimite));
router.patch("/admin/factorlimite/activar/:id", isAuth, isRole([2]), catchedAsync(factorlimiteController.activateFactorlimite));

export default router;
