import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as personapepdirectoController from "../../controllers/usuario/personapepdirectoController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Usuario

//router.get("/usuario/personapepdirecto/listar", verifyToken, checkRole([2]), catchedAsync(personapepdirectoController.getPersonapepdirectopepdirectos));
router.post("/usuario/personapepdirecto/crear", verifyToken, checkRole([2]), catchedAsync(personapepdirectoController.createPersonapepdirecto));
//router.patch("/usuario/personapepdirecto/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personapepdirectoController.updatePersonapepdirectoOnlyAlias));
//router.get("/usuario/personapepdirecto/master", verifyToken, checkRole([2]), catchedAsync(personapepdirectoController.getPersonapepdirectoMaster));

export default router;