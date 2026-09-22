import * as factoringtransferenciacedenteController from "#root/src/controllers/financiero/servicio/factoring/factoringtransferenciacedente.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero

router.get("/financiero/servicio/factoring/factoringtransferenciacedente/master/factoring/:factoringid", isAuth, isRole([6]), catchedAsync(factoringtransferenciacedenteController.getFactoringtransferenciacedenteMasterByFactoringid));

router.get("/financiero/servicio/factoring/factoringtransferenciacedente/buscar/factoring/:id", isAuth, isRole([6]), catchedAsync(factoringtransferenciacedenteController.getFactoringtransferenciacedentesByFactoringid));
router.patch("/financiero/servicio/factoring/factoringtransferenciacedente/enviar/correo/:id", isAuth, isRole([6]), catchedAsync(factoringtransferenciacedenteController.sendCorreoFactoringtransferenciacedente));

export default router;
