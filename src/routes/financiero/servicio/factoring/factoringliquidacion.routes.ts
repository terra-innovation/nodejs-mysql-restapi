import * as factoringliquidacionController from "#root/src/controllers/financiero/servicio/factoring/factoringliquidacion.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero
router.get("/financiero/servicio/factoring/factoringliquidacion/master/factoring/:factoringid", isAuth, isRole([6]), catchedAsync(factoringliquidacionController.getFactoringliquidacionMasterByFactoringid));
router.get("/financiero/servicio/factoring/factoringliquidacion/detalle/:factoringliquidacionid", isAuth, isRole([6]), catchedAsync(factoringliquidacionController.getFactoringliquidacionDetalle));
router.get("/financiero/servicio/factoring/factoringliquidacion/buscar/factoring/:factoringid", isAuth, isRole([6]), catchedAsync(factoringliquidacionController.getFactoringliquidacionByFactoringid));
router.get("/financiero/servicio/factoring/factoringliquidacion/descargar/:factoringliquidacionid", isAuth, isRole([6]), catchedAsync(factoringliquidacionController.downloadFactoringliquidacionPDF));

router.patch("/financiero/servicio/factoring/factoringliquidacion/enviar/correo/:id", isAuth, isRole([6]), catchedAsync(factoringliquidacionController.sendCorreoFactoringliquidacion));
export default router;
