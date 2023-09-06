import { Router } from "express";
import { getTrabajadoresPorRuc, uploadInvoice } from "../controllers/sunat.trabajadores.controller.js";

import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET all Employees by RUC
router.get("/trabajadores/:ruc", verifyToken, getTrabajadoresPorRuc);

// POST upload invoice xml
router.post("/factura/upload", uploadInvoice);

export default router;
