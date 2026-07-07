import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as factoringinversionistaverificacionController from "#src/controllers/admin/factoringinversionistaverificacion.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.get("/admin/servicio/factoring/inversionista/verificacion/listar", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistasByVerificacion));
router.post("/admin/servicio/factoring/inversionista/verificacion/crear", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.createFactoringinversionistaverificacion));
router.patch("/admin/servicio/factoring/inversionista/verificacion/actualizar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.updateFactoringinversionistaverificacion));
router.get("/admin/servicio/factoring/inversionista/verificacion/master", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistaverificacionMaster));
router.delete("/admin/servicio/factoring/inversionista/verificacion/eliminar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.deleteFactoringinversionistaverificacion));
router.patch("/admin/servicio/factoring/inversionista/verificacion/activar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.activateFactoringinversionistaverificacion));

router.get("/admin/servicio/factoring/inversionista/verificacion/buscar/servicioinversionista/:servicioinversionistaid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getServicioinversionistaverificacionsByServicioinversionistaid));

export default router;
