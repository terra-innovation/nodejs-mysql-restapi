import * as facturaController from "#root/src/controllers/financiero/factura.Controller.js";

import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Financiero

router.get("/financiero/factura/buscar/factoring/:id", isAuth, isRole([6]), catchedAsync(facturaController.getFacturasByFactoringid));

router.post("/financiero/factura/factor/subir", isAuth, isRole([6]), catchedAsync(facturaController.subirFacturaFactor));

export default router;
