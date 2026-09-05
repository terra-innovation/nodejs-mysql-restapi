import * as personaController from "#root/src/controllers/admin/persona.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.get("/admin/persona/listar", isAuth, isRole([2]), catchedAsync(personaController.getPersonas));
//router.post("/admin/persona/crear", isAuth, isRole([2]), catchedAsync(personaController.createPersona));
router.patch("/admin/persona/actualizar/:id", isAuth, isRole([2]), catchedAsync(personaController.updatePersona));
router.get("/admin/persona/master", isAuth, isRole([2]), catchedAsync(personaController.getPersonaMaster));
router.delete("/admin/persona/eliminar/:id", isAuth, isRole([2]), catchedAsync(personaController.deletePersona));
router.patch("/admin/persona/activar/:id", isAuth, isRole([2]), catchedAsync(personaController.activatePersona));

export default router;
