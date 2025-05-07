import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringController from "#src/controllers/inversionista/factoring/factoringController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/inversionista/factoring/factoring/listar", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactorings));
//router.post("/inversionista/factoring/factoring/crear", verifyToken, checkRole([2]), catchedAsync(factoringController.createFactoring));
//router.patch("/inversionista/factoring/factoring/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.updateFactoringOnlyAlias));
router.get("/inversionista/factoring/factoring/master", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactoringMaster));

export default router;
