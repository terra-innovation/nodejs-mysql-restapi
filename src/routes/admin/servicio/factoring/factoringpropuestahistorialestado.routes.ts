import * as factoringpropuestahistorialestadoController from "#root/src/controllers/admin/servicio/factoring/factoringpropuestahistorialestado.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
//router.get("/admin/servicio/factoring/factoringpropuestahistorialestado/listar", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestados));
router.post("/admin/servicio/factoring/factoringpropuestahistorialestado/crear", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.createFactoringpropuestahistorialestado));
router.patch("/admin/servicio/factoring/factoringpropuestahistorialestado/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.updateFactoringpropuestahistorialestado));
router.get("/admin/servicio/factoring/factoringpropuestahistorialestado/master", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestadoMaster));
router.delete("/admin/servicio/factoring/factoringpropuestahistorialestado/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.deleteFactoringpropuestahistorialestado));
router.patch("/admin/servicio/factoring/factoringpropuestahistorialestado/activar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.activateFactoringpropuestahistorialestado));

router.get("/admin/servicio/factoring/factoringpropuestahistorialestado/buscar/factoringpropuesta/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestahistorialestadoController.getFactoringpropuestahistorialestadosByFactoringpropuestaid));

export default router;
