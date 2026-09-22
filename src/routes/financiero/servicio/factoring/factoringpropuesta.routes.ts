import * as factoringpropuestaController from "#root/src/controllers/financiero/servicio/factoring/factoringpropuesta.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero
//router.get("/financiero/servicio/factoring/factoringpropuesta/listar", isAuth, isRole([6]), catchedAsync(factoringpropuestaController.getFactoringpropuestas));
router.get("/financiero/servicio/factoring/factoringpropuesta/master", isAuth, isRole([6]), catchedAsync(factoringpropuestaController.getFactoringpropuestaMaster));

router.get("/financiero/servicio/factoring/factoringpropuesta/buscar/factoring/:id", isAuth, isRole([6]), catchedAsync(factoringpropuestaController.getFactoringpropuestasByFactoringid));

router.get("/financiero/servicio/factoring/factoringpropuesta/descargar/:id", isAuth, isRole([6]), catchedAsync(factoringpropuestaController.downloadFactoringpropuestaPDF));

export default router;
