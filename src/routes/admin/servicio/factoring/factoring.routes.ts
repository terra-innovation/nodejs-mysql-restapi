import * as factoringController from "#root/src/controllers/admin/servicio/factoring/factoring.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Empresario
router.get("/admin/servicio/factoring/factoring/listar", isAuth, isRole([2]), catchedAsync(factoringController.getFactorings));
//router.post("/admin/servicio/factoring/factoring/crear", isAuth, isRole([2]), catchedAsync(factoringController.createFactoring));
router.patch("/admin/servicio/factoring/factoring/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringController.updateFactoring));
router.get("/admin/servicio/factoring/factoring/master", isAuth, isRole([2]), catchedAsync(factoringController.getFactoringMaster));
router.delete("/admin/servicio/factoring/factoring/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringController.deleteFactoring));
router.patch("/admin/servicio/factoring/factoring/activar/:id", isAuth, isRole([2]), catchedAsync(factoringController.activateFactoring));

export default router;
