import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as facturaController from "#root/src/controllers/empresario/factura.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
//router.get("/empresario/factura/listar", isAuth, isRole([3]), catchedAsync(facturaController.getFacturas));
//router.post("/empresario/factura/crear", isAuth, isRole([3]), catchedAsync(facturaController.createFactura));
//router.patch("/empresario/factura/actualizar/:id", isAuth, isRole([3]), catchedAsync(facturaController.updateFactura));
//router.get("/empresario/factura/master", isAuth, isRole([3]), catchedAsync(facturaController.getFacturaMaster));
//router.delete("/empresario/factura/eliminar/:id", isAuth, isRole([3]), catchedAsync(facturaController.deleteFactura));
//router.patch("/empresario/factura/activar/:id", isAuth, isRole([3]), catchedAsync(facturaController.activateFactura));

router.get("/empresario/factura/buscar/factoring/:id", isAuth, isRole([3]), catchedAsync(facturaController.getFacturasByFactoringid));

export default router;
