import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringempresaverificacionController from "#src/controllers/admin/factoringempresaverificacionController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Usuario
router.get("/admin/servicio/factoring/empresa/verificacion/listar", verifyToken, checkRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresasByVerificacion));
router.post("/admin/servicio/factoring/empresa/verificacion/crear", verifyToken, checkRole([2]), catchedAsync(factoringempresaverificacionController.createFactoringempresaverificacion));
//router.patch("/admin/personaverificacion/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.updatePersonaverificacion));
router.get("/admin/servicio/factoring/empresa/verificacion/master", verifyToken, checkRole([2]), catchedAsync(factoringempresaverificacionController.getFactoringempresaverificacionMaster));
//router.delete("/admin/personaverificacion/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.deletePersonaverificacion));
//router.patch("/admin/personaverificacion/activar/:id", verifyToken, checkRole([2]), catchedAsync(personaverificacionController.activatePersonaverificacion));

export default router;
