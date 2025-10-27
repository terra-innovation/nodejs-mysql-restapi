import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as facturaController from "#src/controllers/admin/factura.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
//router.get("/admin/factura/listar", isAuth, isRole([2]), catchedAsync(facturaController.getFacturas));
//router.post("/admin/factura/crear", isAuth, isRole([2]), catchedAsync(facturaController.createFactura));
//router.patch("/admin/factura/actualizar/:id", isAuth, isRole([2]), catchedAsync(facturaController.updateFactura));
//router.get("/admin/factura/master", isAuth, isRole([2]), catchedAsync(facturaController.getFacturaMaster));
//router.delete("/admin/factura/eliminar/:id", isAuth, isRole([2]), catchedAsync(facturaController.deleteFactura));
//router.patch("/admin/factura/activar/:id", isAuth, isRole([2]), catchedAsync(facturaController.activateFactura));

router.get("/admin/factura/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(facturaController.getFacturasByFactoringid));

export default router;
