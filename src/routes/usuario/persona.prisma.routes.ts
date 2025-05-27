import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as personaController from "#src/controllers/usuario/personaController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";
import * as personaMiddleware from "#src/middlewares/personaMiddleware.js";

const router = Router();

//Usuario
//router.get("/usuario/persona/listar", verifyToken, checkRole([2]), catchedAsync(personaController.getPersonas));
//router.post("/usuario/persona/crear", verifyToken, checkRole([2]), catchedAsync(personaController.createPersona));
//router.patch("/usuario/persona/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personaController.updatePersonaOnlyAlias));
router.get("/usuario/persona/master", verifyToken, checkRole([2]), catchedAsync(personaController.getPersonaMaster));

router.post("/usuario/persona/verificar", verifyToken, checkRole([2]), personaMiddleware.upload, catchedAsync(personaController.verifyPersona));
export default router;
