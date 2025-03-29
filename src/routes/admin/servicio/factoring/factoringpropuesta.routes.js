import { Router } from "express";
import { catchedAsync } from "../../../../utils/catchedAsync.js";
import * as factoringpropuestaController from "../../../../controllers/admin/servicio/factoring/factoringpropuestaController.js";
import { verifyToken, checkRole } from "../../../../middlewares/authMiddleware.js";

const router = Router();

//Admin
//router.get("/admin/servicio/factoring/factoringpropuesta/listar", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestas));
router.post("/admin/servicio/factoring/factoringpropuesta/crear", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.createFactoringpropuesta));
router.patch("/admin/servicio/factoring/factoringpropuesta/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.updateFactoringpropuesta));
router.get("/admin/servicio/factoring/factoringpropuesta/master", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestaMaster));
router.delete("/admin/servicio/factoring/factoringpropuesta/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.deleteFactoringpropuesta));
router.patch("/admin/servicio/factoring/factoringpropuesta/activar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.activateFactoringpropuesta));

router.post("/admin/servicio/factoring/factoringpropuesta/simular/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.simulateFactoringpropuesta));
router.get("/admin/servicio/factoring/factoringpropuesta/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestasByFactoringid));

export default router;
