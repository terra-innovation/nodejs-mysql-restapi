import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import * as personaverificacionController from "#src/controllers/admin/personaverificacion.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.get("/admin/personaverificacion/listar", isAuth, isRole([2]), catchedAsync(personaverificacionController.getPersonaverificacions));
router.post("/admin/personaverificacion/crear", isAuth, isRole([2]), catchedAsync(personaverificacionController.createPersonaverificacion));
router.patch("/admin/personaverificacion/actualizar/:personaverificacionid", isAuth, isRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/personaverificacion/master", isAuth, isRole([2]), catchedAsync(personaverificacionController.getPersonaverificacionMaster));
router.delete("/admin/personaverificacion/eliminar/:personaverificacionid", isAuth, isRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
router.patch("/admin/personaverificacion/activar/:personaverificacionid", isAuth, isRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

router.get("/admin/personaverificacion/buscar/persona/:personaid", isAuth, isRole([2]), catchedAsync(personaverificacionController.getPersonaverificacionsByPersonaid));

export default router;
