import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as facturaController from "#src/controllers/facturaController.js";

import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";
import * as facturaMiddleware from "#src/middlewares/facturaMiddleware.js";

const router = Router();

// GET all Employees by RUC
router.get("/trabajadores/:ruc", verifyToken, facturaController.getTrabajadoresPorRuc);

// POST upload invoice xml
router.post("/factura/upload", verifyToken, checkRole([2]), facturaMiddleware.upload, catchedAsync(facturaController.uploadInvoice));

export default router;
