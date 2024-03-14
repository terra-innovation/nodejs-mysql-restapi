import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as empresasController from "../controllers/empresasController.js";

const router = Router();

// GET all Empresas
router.get("/empresas", catchedAsync(empresasController.getEmpresas));

// GET Empresa
router.get("/empresas/:id", catchedAsync(empresasController.getEmpresa));

// INSERT Empresa
router.post("/empresas", catchedAsync(empresasController.createEmpresa));

// UPDATE Empresa
router.patch("/empresas/:id", catchedAsync(empresasController.updateEmpresa));

// DELETE Empresa
router.delete("/empresas/:id", catchedAsync(empresasController.deleteEmpresa));

export default router;
