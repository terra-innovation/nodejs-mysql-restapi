import * as factoringController from "#src/controllers/empresario/factoring/factoring.prisma.Controller.js";
import { checkRole, verifyToken } from "#src/middlewares/auth.prisma.Middleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

const protectEmpresario = [verifyToken, checkRole([3])];

//Empresario
router.get("/empresario/factoring/factoring/listar", ...protectEmpresario, catchedAsync(factoringController.getFactorings));
router.post("/empresario/factoring/factoring/crear", verifyToken, checkRole([3]), catchedAsync(factoringController.createFactoring));
//router.patch("/empresario/factoring/factoring/actualizar/:id", verifyToken, checkRole([3]), catchedAsync(factoringController.updateFactoringOnlyAlias));
router.get("/empresario/factoring/factoring/master", verifyToken, checkRole([3]), catchedAsync(factoringController.getFactoringMaster));

export default router;
