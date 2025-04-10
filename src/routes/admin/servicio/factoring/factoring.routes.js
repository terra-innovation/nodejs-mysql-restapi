import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringController from "#src/controllers/admin/servicio/factoring/factoringController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/admin/servicio/factoring/factoring/listar", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactorings));
//router.post("/admin/servicio/factoring/factoring/crear", verifyToken, checkRole([2]), catchedAsync(factoringController.createFactoring));
router.patch("/admin/servicio/factoring/factoring/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.updateFactoring));
router.get("/admin/servicio/factoring/factoring/master", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactoringMaster));
router.post("/admin/servicio/factoring/factoring/simular/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.simulateFactoring));

export default router;
