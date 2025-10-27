import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringempresaverificacionController from "#src/controllers/admin/factoringempresaverificacion.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/admin/servicio/factoring/empresa/verificacion/listar", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresasByVerificacion));
router.post("/admin/servicio/factoring/empresa/verificacion/crear", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.createFactoringempresaverificacion));
//router.patch("/admin/personaverificacion/actualizar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/servicio/factoring/empresa/verificacion/master", isAuth, isRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresaverificacionMaster));
//router.delete("/admin/personaverificacion/eliminar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
//router.patch("/admin/personaverificacion/activar/:id", isAuth, isRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

export default router;
