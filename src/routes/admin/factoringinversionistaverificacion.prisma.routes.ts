import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringinversionistaverificacionController from "#src/controllers/admin/factoringinversionistaverificacion.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/admin/servicio/factoring/inversionista/verificacion/listar", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistasByVerificacion));
router.post("/admin/servicio/factoring/inversionista/verificacion/crear", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.createFactoringinversionistaverificacion));
//router.patch("/admin/personaverificacion/actualizar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/servicio/factoring/inversionista/verificacion/master", isAuth, isRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistaverificacionMaster));
//router.delete("/admin/personaverificacion/eliminar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
//router.patch("/admin/personaverificacion/activar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

export default router;
