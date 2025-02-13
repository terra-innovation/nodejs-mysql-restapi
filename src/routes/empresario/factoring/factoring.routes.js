import { Router } from "express";
import { catchedAsync } from "../../../utils/catchedAsync.js";
import * as factoringController from "../../../controllers/empresario/factoring/factoringController.js";
import { verifyToken, checkRole } from "../../../middlewares/authMiddleware.js";

const router = Router();

//Empresario
//router.get("/empresario/factoring/factoring/listar", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactorings));
router.post("/empresario/factoring/factoring/crear", verifyToken, checkRole([2]), catchedAsync(factoringController.createFactoring));
//router.patch("/empresario/factoring/factoring/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.updateFactoringOnlyAlias));
//router.get("/empresario/factoring/factoring/master", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactoringMaster));

export default router;
