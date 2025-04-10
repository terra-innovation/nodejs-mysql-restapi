import { Router } from "express";
import * as facturaController from "#src/controllers/empresario/facturaController.js";
import { checkRole, verifyToken } from "#src/middlewares/authMiddleware.js";
import * as facturaMiddleware from "#src/middlewares/facturaMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";

const router = Router();

//Factura
//router.get("/empresario/factoring/factura/listar", verifyToken, checkRole([2]), catchedAsync(facturaController.getPersonas));
//router.post("/empresario/factoring/factura/crear", verifyToken, checkRole([2]), catchedAsync(facturaController.createPersona));
//router.patch("/empresario/factoring/factura/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.updatePersonaOnlyAlias));
//router.get("/empresario/factoring/factura/master", verifyToken, checkRole([2]), catchedAsync(facturaController.getPersonaMaster));

router.post("/empresario/factoring/factura/subir", verifyToken, checkRole([2]), facturaMiddleware.upload, catchedAsync(facturaController.subirFactura));
export default router;
