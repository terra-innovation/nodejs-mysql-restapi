import * as factoringfacturafactorController from "#root/src/controllers/financiero/servicio/factoring/factoringfacturafactor.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero

router.post("/financiero/servicio/factoring/factoringfacturafactor/crear", isAuth, isRole([6]), catchedAsync(factoringfacturafactorController.createFactoringfacturafactor));
router.patch("/financiero/servicio/factoring/factoringfacturafactor/actualizar/:id", isAuth, isRole([6]), catchedAsync(factoringfacturafactorController.updateFactoringfacturafactor));
router.get("/financiero/servicio/factoring/factoringfacturafactor/master/factoring/:factoringid", isAuth, isRole([6]), catchedAsync(factoringfacturafactorController.getFactoringfacturafactorMasterByFactoringid));

router.get("/financiero/servicio/factoring/factoringfacturafactor/buscar/factoring/:id", isAuth, isRole([6]), catchedAsync(factoringfacturafactorController.getFactoringfacturafactoresByFactoringid));

export default router;
