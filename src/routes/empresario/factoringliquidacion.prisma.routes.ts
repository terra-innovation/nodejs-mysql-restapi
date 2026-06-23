import * as factoringliquidacionController from "#root/src/controllers/empresario/factoringliquidacion.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

router.get("/empresario/factoringliquidacion/buscar/factoring/:factoringid", isAuth, isRole([3]), catchedAsync(factoringliquidacionController.getFactoringliquidacionsByFactoringid));
router.get("/empresario/factoringliquidacion/descargar/:factoringliquidacionid", isAuth, isRole([3]), catchedAsync(factoringliquidacionController.downloadFactoringliquidacionPDF));

export default router;
