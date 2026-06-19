import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as factoringliquidacionController from "#src/controllers/admin/servicio/factoring/factoringliquidacion.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.post("/admin/servicio/factoring/factoringliquidacion/crear", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.createFactoringliquidacion));
router.patch("/admin/servicio/factoring/factoringliquidacion/actualizar/:factoringliquidacionid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.updateFactoringliquidacion));
router.get("/admin/servicio/factoring/factoringliquidacion/master/:factoringid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.getFactoringliquidacionMaster));
router.delete("/admin/servicio/factoring/factoringliquidacion/eliminar/:factoringliquidacionid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.deleteFactoringliquidacion));
router.patch("/admin/servicio/factoring/factoringliquidacion/activar/:factoringliquidacionid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.activateFactoringliquidacion));
router.post("/admin/servicio/factoring/factoringliquidacion/simular/:factoringid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.simulateFactoringliquidacion));
router.get("/admin/servicio/factoring/factoringliquidacion/detalle/:factoringliquidacionid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.getFactoringliquidacionDetalle));
router.get("/admin/servicio/factoring/factoringliquidacion/buscar/factoring/:factoringid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.getFactoringliquidacionByFactoringid));
router.get("/admin/servicio/factoring/factoringliquidacion/descargar/:factoringliquidacionid", isAuth, isRole([2]), catchedAsync(factoringliquidacionController.downloadFactoringliquidacionPDF));

export default router;
