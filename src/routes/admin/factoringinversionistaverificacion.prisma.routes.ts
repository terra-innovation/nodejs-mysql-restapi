import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringinversionistaverificacionController from "#src/controllers/admin/factoringinversionistaverificacion.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/admin/servicio/factoring/inversionista/verificacion/listar", verifyToken, checkRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistasByVerificacion));
router.post("/admin/servicio/factoring/inversionista/verificacion/crear", verifyToken, checkRole([2]), catchedAsync(factoringinversionistaverificacionController.createFactoringinversionistaverificacion));
//router.patch("/admin/personaverificacion/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/servicio/factoring/inversionista/verificacion/master", verifyToken, checkRole([2]), catchedAsync(factoringinversionistaverificacionController.getFactoringinversionistaverificacionMaster));
//router.delete("/admin/personaverificacion/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
//router.patch("/admin/personaverificacion/activar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

export default router;
