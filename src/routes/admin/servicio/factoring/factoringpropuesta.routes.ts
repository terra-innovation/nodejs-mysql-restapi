import * as factoringpropuestaController from "#root/src/controllers/admin/servicio/factoring/factoringpropuesta.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
//router.get("/admin/servicio/factoring/factoringpropuesta/listar", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestas));
router.post("/admin/servicio/factoring/factoringpropuesta/crear", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.createFactoringpropuesta));
router.patch("/admin/servicio/factoring/factoringpropuesta/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.updateFactoringpropuesta));
router.get("/admin/servicio/factoring/factoringpropuesta/master", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestaMaster));
router.delete("/admin/servicio/factoring/factoringpropuesta/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.deleteFactoringpropuesta));
router.patch("/admin/servicio/factoring/factoringpropuesta/activar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.activateFactoringpropuesta));

router.post("/admin/servicio/factoring/factoringpropuesta/simular/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.simulateFactoringpropuesta));
router.get("/admin/servicio/factoring/factoringpropuesta/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestasByFactoringid));

router.get("/admin/servicio/factoring/factoringpropuesta/descargar/:id", isAuth, isRole([2]), catchedAsync(factoringpropuestaController.downloadFactoringpropuestaPDF));

export default router;
