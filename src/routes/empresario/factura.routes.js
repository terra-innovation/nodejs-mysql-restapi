import { Router } from "express";
import * as facturaController from "../../controllers/empresario/facturaController.js";
import { checkRole, verifyToken } from "../../middlewares/authMiddleware.js";
import * as facturaMiddleware from "../../middlewares/factura2Middleware.js";
import { catchedAsync } from "../../utils/catchedAsync.js";

const router = Router();

//Factura
//router.get("/empresario/factura/listar", verifyToken, checkRole([2]), catchedAsync(facturaController.getPersonas));
//router.post("/empresario/factura/crear", verifyToken, checkRole([2]), catchedAsync(facturaController.createPersona));
//router.patch("/empresario/factura/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(facturaController.updatePersonaOnlyAlias));
//router.get("/empresario/factura/master", verifyToken, checkRole([2]), catchedAsync(facturaController.getPersonaMaster));

router.post("/empresario/factura/subir", verifyToken, checkRole([2]), facturaMiddleware.upload, catchedAsync(facturaController.subirFactura));
export default router;
