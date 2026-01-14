import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringsimulacionController from "#src/controllers/admin/servicio/factoring/factoringsimulacion.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/servicio/factoring/factoringsimulacion/listar", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.getFactoringsimulacions));
router.post("/admin/servicio/factoring/factoringsimulacion/crear", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.createFactoringsimulacion));
//router.patch("/admin/servicio/factoring/factoringsimulacion/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.updateFactoringsimulacion));
router.get("/admin/servicio/factoring/factoringsimulacion/master", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.getFactoringsimulacionMaster));
router.delete("/admin/servicio/factoring/factoringsimulacion/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.deleteFactoringsimulacion));
router.patch("/admin/servicio/factoring/factoringsimulacion/activar/:id", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.activateFactoringsimulacion));

router.post("/admin/servicio/factoring/factoringsimulacion/simular", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.simulateFactoringsimulacion));

router.get("/admin/servicio/factoring/factoringsimulacion/descargar/:id", isAuth, isRole([2]), catchedAsync(factoringsimulacionController.downloadFactoringsimulacionPDF));

export default router;
