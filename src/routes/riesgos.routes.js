import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as riesgosController from "#src/controllers/riesgosController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

// GET all Riesgos
router.get("/riesgos/listar", verifyToken, checkRole([2]), catchedAsync(riesgosController.getRiesgos));

// GET Riesgo
router.get("/riesgos/listar/:id", verifyToken, checkRole([2]), catchedAsync(riesgosController.getRiesgo));

// INSERT Riesgo
router.post("/riesgos/crear", verifyToken, checkRole([2]), catchedAsync(riesgosController.createRiesgo));

// UPDATE Riesgo
router.patch("/riesgos/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(riesgosController.updateRiesgo));

// DELETE Riesgo
router.delete("/riesgos/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(riesgosController.deleteRiesgo));

export default router;
