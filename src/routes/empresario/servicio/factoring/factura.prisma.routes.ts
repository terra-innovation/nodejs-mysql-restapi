import * as facturaController from "#root/src/controllers/empresario/factoring/factura.prisma.Controller.js";
import { isRole, isAuth } from "#src/middlewares/auth.prisma.Middleware.js";
import * as facturaMiddleware from "#src/middlewares/facturaMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Factura
//router.get("/empresario/servicio/factoring/factura/listar", isAuth, isRole([3]), catchedAsync(facturaController.getPersonas));
//router.post("/empresario/servicio/factoring/factura/crear", isAuth, isRole([3]), catchedAsync(facturaController.createPersona));
//router.patch("/empresario/servicio/factoring/factura/actualizar/:id", isAuth, isRole([3]), catchedAsync(facturaController.updatePersonaOnlyAlias));
//router.get("/empresario/servicio/factoring/factura/master", isAuth, isRole([3]), catchedAsync(facturaController.getPersonaMaster));

router.post("/empresario/servicio/factoring/factura/subir", isAuth, isRole([3]), facturaMiddleware.upload, catchedAsync(facturaController.subirFactura));
export default router;
