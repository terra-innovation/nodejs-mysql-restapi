import * as facturaController from "#root/src/controllers/empresario/factoring/factura.prisma.Controller.js";
import { checkRole, verifyToken } from "#src/middlewares/auth.prisma.Middleware.js";
import * as facturaMiddleware from "#src/middlewares/facturaMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Factura
//router.get("/empresario/servicio/factoring/factura/listar", verifyToken, checkRole([3]), catchedAsync(facturaController.getPersonas));
//router.post("/empresario/servicio/factoring/factura/crear", verifyToken, checkRole([3]), catchedAsync(facturaController.createPersona));
//router.patch("/empresario/servicio/factoring/factura/actualizar/:id", verifyToken, checkRole([3]), catchedAsync(facturaController.updatePersonaOnlyAlias));
//router.get("/empresario/servicio/factoring/factura/master", verifyToken, checkRole([3]), catchedAsync(facturaController.getPersonaMaster));

router.post("/empresario/servicio/factoring/factura/subir", verifyToken, checkRole([3]), facturaMiddleware.upload, catchedAsync(facturaController.subirFactura));
export default router;
