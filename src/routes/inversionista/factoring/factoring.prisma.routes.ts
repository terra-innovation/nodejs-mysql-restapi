import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringController from "#src/controllers/inversionista/factoring/factoring.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/inversionista/factoring/factoring/listar", isAuth, isRole([4]), catchedAsync(factoringController.getFactorings));
//router.post("/inversionista/factoring/factoring/crear", isAuth, isRole([4]), catchedAsync(factoringController.createFactoring));
//router.patch("/inversionista/factoring/factoring/actualizar/:id", isAuth, isRole([4]), catchedAsync(factoringController.updateFactoringOnlyAlias));
router.get("/inversionista/factoring/factoring/master", isAuth, isRole([4]), catchedAsync(factoringController.getFactoringMaster));

export default router;
