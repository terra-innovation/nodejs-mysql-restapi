import * as factoringhistorialestadoController from "#root/src/controllers/financiero/servicio/factoring/factoringhistorialestado.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero
//router.get("/financiero/servicio/factoring/factoringhistorialestado/listar", isAuth, isRole([6]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestados));
router.get("/financiero/servicio/factoring/factoringhistorialestado/master", isAuth, isRole([6]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadoMaster));

router.get("/financiero/servicio/factoring/factoringhistorialestado/buscar/factoring/:id", isAuth, isRole([6]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadosByFactoringid));

export default router;
