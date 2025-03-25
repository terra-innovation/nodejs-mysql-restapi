import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as factoringpropuestaController from "../../controllers/admin/factoringpropuestaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
//router.get("/admin/factoringpropuesta/listar", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestas));
router.post("/admin/factoringpropuesta/crear", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.createFactoringpropuesta));
//router.patch("/admin/factoringpropuesta/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.updateFactoringpropuesta));
router.get("/admin/factoringpropuesta/master", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestaMaster));
//router.delete("/admin/factoringpropuesta/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.deleteFactoringpropuesta));
//router.patch("/admin/factoringpropuesta/activar/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.activateFactoringpropuesta));

router.post("/admin/factoringpropuesta/simular/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.simulateFactoringpropuesta));
router.get("/admin/factoringpropuesta/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(factoringpropuestaController.getFactoringpropuestasByFactoringid));

export default router;
