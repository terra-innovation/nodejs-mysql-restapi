import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as factoringsController from "../controllers/factoringsController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

//Mio
router.post("/factorings/mio/listar/empresaid/activo/:id", verifyToken, checkRole([2]), catchedAsync(factoringsController.getFactoringsMiosByEmpresaidActivos));

// GET all Factorings
router.get("/factorings/listar", verifyToken, checkRole([2]), catchedAsync(factoringsController.getFactorings));

// GET Factoring
router.get("/factorings/listar/:id", verifyToken, checkRole([2]), catchedAsync(factoringsController.getFactoring));

// INSERT Factoring
router.post("/factorings/crear", verifyToken, checkRole([2]), catchedAsync(factoringsController.createFactoring));

// UPDATE Factoring
router.patch("/factorings/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringsController.updateFactoring));

// DELETE Factoring
router.delete("/factorings/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringsController.deleteFactoring));

export default router;
