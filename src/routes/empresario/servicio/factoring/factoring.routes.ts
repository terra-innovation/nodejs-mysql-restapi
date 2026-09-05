import * as factoringController from "#root/src/controllers/empresario/factoring/factoring.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

const protectEmpresario = [isAuth, isRole([3])];

//Empresario
router.get("/empresario/servicio/factoring/factoring/listar", ...protectEmpresario, catchedAsync(factoringController.getFactorings));
router.post("/empresario/servicio/factoring/factoring/crear", isAuth, isRole([3]), catchedAsync(factoringController.createFactoring));
//router.patch("/empresario/servicio/factoring/factoring/actualizar/:id", isAuth, isRole([3]), catchedAsync(factoringController.updateFactoringOnlyAlias));
router.get("/empresario/servicio/factoring/factoring/master", isAuth, isRole([3]), catchedAsync(factoringController.getFactoringMaster));

export default router;
