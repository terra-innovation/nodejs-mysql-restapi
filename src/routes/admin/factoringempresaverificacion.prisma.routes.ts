import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as factoringempresaverificacionController from "#src/controllers/admin/factoringempresaverificacion.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

export const endpoints = {
  key: "/admin/servicio/factoring/empresa/verificacion",
};

//Usuario
router.get(endpoints.key + "/listar", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresasByVerificacion));
router.post(endpoints.key + "/crear", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.createFactoringempresaverificacion));
router.patch(endpoints.key + "/actualizar/:servicioempresaverificacionid", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.updateFactoringempresaverificacion));
router.get(endpoints.key + "/master", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresaverificacionMaster));
router.delete(endpoints.key + "/eliminar/:servicioempresaverificacionid", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.deleteFactoringempresaverificacion));
router.patch(endpoints.key + "/activar/:servicioempresaverificacionid", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.activateFactoringempresaverificacion));

router.get(endpoints.key + "/buscar/servicioempresa/:servicioempresaid", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.getServicioempresaverificacionsByServicioempresaid));

export default router;
