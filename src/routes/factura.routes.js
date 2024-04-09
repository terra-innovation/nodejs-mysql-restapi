import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as facturaController from "../controllers/facturaController.js";

import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";
import * as facturaMiddleware from "../middlewares/facturaMiddleware.js";

const router = Router();

// GET all Employees by RUC
router.get("/trabajadores/:ruc", verifyToken, facturaController.getTrabajadoresPorRuc);

// POST upload invoice xml
router.post("/factura/upload", verifyToken, checkRole([2]), facturaMiddleware.upload, catchedAsync(facturaController.uploadInvoice));

export default router;
