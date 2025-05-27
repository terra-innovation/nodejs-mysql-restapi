import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as facturaController from "#src/controllers/admin/facturaController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Admin
//router.get("/admin/factura/listar", verifyToken, checkRole([2]), catchedAsync(facturaController.getFacturas));
//router.post("/admin/factura/crear", verifyToken, checkRole([2]), catchedAsync(facturaController.createFactura));
//router.patch("/admin/factura/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.updateFactura));
//router.get("/admin/factura/master", verifyToken, checkRole([2]), catchedAsync(facturaController.getFacturaMaster));
//router.delete("/admin/factura/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.deleteFactura));
//router.patch("/admin/factura/activar/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.activateFactura));

router.get("/admin/factura/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.getFacturasByFactoringid));

export default router;
