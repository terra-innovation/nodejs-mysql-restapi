import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as colaboradoresController from "../controllers/colaboradoresController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

// GET all Colaboradores
router.get("/colaboradores", verifyToken, checkRole([1]), catchedAsync(colaboradoresController.getColaboradores));

// GET Colaborador
router.get("/colaboradores/:id", verifyToken, checkRole([1]), catchedAsync(colaboradoresController.getColaborador));

// INSERT Colaborador
router.post("/colaboradores", verifyToken, checkRole([1]), catchedAsync(colaboradoresController.createColaborador));

// UPDATE Colaborador
router.patch("/colaboradores/:id", verifyToken, checkRole([1]), catchedAsync(colaboradoresController.updateColaborador));

// DELETE Colaborador
router.delete("/colaboradores/:id", verifyToken, checkRole([1]), catchedAsync(colaboradoresController.deleteColaborador));

export default router;