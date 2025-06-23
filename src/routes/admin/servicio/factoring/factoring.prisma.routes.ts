import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringController from "#src/controllers/admin/servicio/factoring/factoring.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/admin/servicio/factoring/factoring/listar", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactorings));
//router.post("/admin/servicio/factoring/factoring/crear", verifyToken, checkRole([2]), catchedAsync(factoringController.createFactoring));
router.patch("/admin/servicio/factoring/factoring/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.updateFactoring));
router.get("/admin/servicio/factoring/factoring/master", verifyToken, checkRole([2]), catchedAsync(factoringController.getFactoringMaster));
router.delete("/admin/servicio/factoring/factoring/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.deleteFactoring));
router.patch("/admin/servicio/factoring/factoring/activar/:id", verifyToken, checkRole([2]), catchedAsync(factoringController.activateFactoring));

export default router;
