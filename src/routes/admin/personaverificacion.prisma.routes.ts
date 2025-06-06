import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as personaverificacionController from "#src/controllers/admin/personaverificacion.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/admin/personaverificacion/listar", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.getPersonaverificacions));
router.post("/admin/personaverificacion/crear", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.createPersonaverificacion));
router.patch("/admin/personaverificacion/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/personaverificacion/master", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.getPersonaverificacionMaster));
router.delete("/admin/personaverificacion/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
router.patch("/admin/personaverificacion/activar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

export default router;
