import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as factoringestadosController from "../controllers/factoringestadosController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

// GET all Factoringestados
router.get("/factoringestados/listar", verifyToken, checkRole([2]), catchedAsync(factoringestadosController.getFactoringestados));

// GET Factoringestado
router.get("/factoringestados/listar/:id", verifyToken, checkRole([2]), catchedAsync(factoringestadosController.getFactoringestado));

// INSERT Factoringestado
router.post("/factoringestados/crear", verifyToken, checkRole([2]), catchedAsync(factoringestadosController.createFactoringestado));

// UPDATE Factoringestado
router.patch("/factoringestados/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringestadosController.updateFactoringestado));

// DELETE Factoringestado
router.delete("/factoringestados/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringestadosController.deleteFactoringestado));

export default router;
