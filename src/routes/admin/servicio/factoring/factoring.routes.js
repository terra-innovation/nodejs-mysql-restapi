import { Router } from "express";
import { catchedAsync } from "../../../../utils/catchedAsync.js";
import * as factoringController from "../../../../controllers/admin/servicio/factoring/factoringController.js";
import { verifyToken, checkRole } from "../../../../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/admin/servicio/factoring/factoring/listar", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactorings));
//router.post("/admin/servicio/factoring/factoring/crear", verifyToken, checkRole([2]), catchedAsync(factoringController.createFactoring));
//router.patch("/admin/servicio/factoring/factoring/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.updateFactoringOnlyAlias));
router.get("/admin/servicio/factoring/factoring/master", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactoringMaster));

export default router;
