import * as factoringpropuestahistorialestadoController from "#root/src/controllers/financiero/servicio/factoring/factoringpropuestahistorialestado.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero
//router.get("/financiero/servicio/factoring/factoringpropuestahistorialestado/listar", isAuth, isRole([6]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestados));
router.get("/financiero/servicio/factoring/factoringpropuestahistorialestado/master", isAuth, isRole([6]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestadoMaster));

router.get("/financiero/servicio/factoring/factoringpropuestahistorialestado/buscar/factoringpropuesta/:id", isAuth, isRole([6]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestadosByFactoringpropuestaid));

export default router;
