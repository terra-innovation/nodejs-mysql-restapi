import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as empresasController from "../controllers/empresasController.js";

import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

// GET all Empresas
router.get("/empresas", verifyToken, checkRole([1]), catchedAsync(empresasController.getEmpresas));

// GET Empresa
router.get("/empresas/:id", verifyToken, checkRole([1]), catchedAsync(empresasController.getEmpresa));

// INSERT Empresa
router.post("/empresas", verifyToken, checkRole([1]), catchedAsync(empresasController.createEmpresa));

// UPDATE Empresa
router.patch("/empresas/:id", verifyToken, checkRole([1]), catchedAsync(empresasController.updateEmpresa));

// DELETE Empresa
router.delete("/empresas/:id", verifyToken, checkRole([1]), catchedAsync(empresasController.deleteEmpresa));

export default router;
