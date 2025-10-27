import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as personaController from "#src/controllers/admin/persona.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";
import * as personaMiddleware from "#src/middlewares/personaMiddleware.js";

const router = Router();

//Usuario
router.get("/admin/persona/listar", isAuth, isRole([2]), catchedAsync(personaController.getPersonas));
//router.post("/admin/persona/crear", isAuth, isRole([2]), catchedAsync(personaController.createPersona));
router.patch("/admin/persona/actualizar/:id", isAuth, isRole([2]), catchedAsync(personaController.updatePersona));
router.get("/admin/persona/master", isAuth, isRole([2]), catchedAsync(personaController.getPersonaMaster));
router.delete("/admin/persona/eliminar/:id", isAuth, isRole([2]), catchedAsync(personaController.deletePersona));
router.patch("/admin/persona/activar/:id", isAuth, isRole([2]), catchedAsync(personaController.activatePersona));

export default router;
