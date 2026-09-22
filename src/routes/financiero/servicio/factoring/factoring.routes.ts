import * as factoringController from "#root/src/controllers/financiero/servicio/factoring/factoring.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero
router.get("/financiero/servicio/factoring/factoring/listar", isAuth, isRole([6]), catchedAsync(factoringController.getFactorings));
router.get("/financiero/servicio/factoring/factoring/master", isAuth, isRole([6]), catchedAsync(factoringController.getFactoringMaster));

export default router;
