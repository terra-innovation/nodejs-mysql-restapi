import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as personaController from "../../controllers/admin/personaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";
import * as personaMiddleware from "../../middlewares/personaMiddleware.js";

const router = Router();

//Usuario
router.get("/admin/persona/listar", verifyToken, checkRole([2]), catchedAsync(personaController.getPersonas));
//router.post("/admin/persona/crear", verifyToken, checkRole([2]), catchedAsync(personaController.createPersona));
router.patch("/admin/persona/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personaController.updatePersona));
router.get("/admin/persona/master", verifyToken, checkRole([2]), catchedAsync(personaController.getPersonaMaster));
router.delete("/admin/persona/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(personaController.deletePersona));
router.patch("/admin/persona/activar/:id", verifyToken, checkRole([2]), catchedAsync(personaController.activatePersona));

export default router;