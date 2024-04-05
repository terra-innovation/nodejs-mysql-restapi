import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as empresasController from "../controllers/empresasController.js";

import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/empresario/giradores/:id", verifyToken, checkRole([2]), catchedAsync(empresasController.getGirador));
router.get("/empresario/aceptantes/:id", verifyToken, checkRole([2]), catchedAsync(empresasController.getEmpresa));

// GET all Empresas
router.get("/empresas", verifyToken, checkRole([2]), catchedAsync(empresasController.getEmpresas));

// GET Empresa
router.get("/empresas/:id", verifyToken, checkRole([2]), catchedAsync(empresasController.getEmpresa));

// INSERT Empresa
router.post("/empresas", verifyToken, checkRole([2]), catchedAsync(empresasController.createEmpresa));

// UPDATE Empresa
router.patch("/empresas/:id", verifyToken, checkRole([2]), catchedAsync(empresasController.updateEmpresa));

// DELETE Empresa
router.delete("/empresas/:id", verifyToken, checkRole([2]), catchedAsync(empresasController.deleteEmpresa));

export default router;
