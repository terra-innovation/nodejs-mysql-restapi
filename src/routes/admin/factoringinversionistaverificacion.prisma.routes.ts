import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as factoringinversionistaverificacionController from "#src/controllers/admin/factoringinversionistaverificacion.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

export const endpoints = {
  key: "/admin/servicio/factoring/inversionista/verificacion",
};

//Usuario
router.get(endpoints.key + "/listar", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistasByVerificacion));
router.post(endpoints.key + "/crear", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.createFactoringinversionistaverificacion));
router.patch(endpoints.key + "/actualizar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.updateFactoringinversionistaverificacion));
router.get(endpoints.key + "/master", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistaverificacionMaster));
router.delete(endpoints.key + "/eliminar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.deleteFactoringinversionistaverificacion));
router.patch(endpoints.key + "/activar/:servicioinversionistaverificacionid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.activateFactoringinversionistaverificacion));

router.get(endpoints.key + "/buscar/servicioinversionista/:servicioinversionistaid", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getServicioinversionistaverificacionsByServicioinversionistaid));

export default router;
