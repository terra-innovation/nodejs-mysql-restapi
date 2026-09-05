import * as personaController from "#root/src/controllers/usuario/persona.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
//router.get("/usuario/persona/listar", isAuth, isRole([5]), catchedAsync(personaController.getPersonas));
//router.post("/usuario/persona/crear", isAuth, isRole([5]), catchedAsync(personaController.createPersona));
//router.patch("/usuario/persona/actualizar/:id", isAuth, isRole([5]), catchedAsync(personaController.updatePersonaOnlyAlias));
router.get("/usuario/persona/master", isAuth, isRole([5]), catchedAsync(personaController.getPersonaMaster));

router.post("/usuario/persona/verificar", isAuth, isRole([5]), catchedAsync(personaController.verifyPersona));
export default router;
