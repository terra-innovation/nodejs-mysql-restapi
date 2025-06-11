import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioController from "#src/controllers/usuario/usuario.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
//router.get("/usuario/usuario/listar", verifyToken, checkRole([5]), catchedAsync(usuarioController.getPersonas));
//router.post("/usuario/usuario/crear", verifyToken, checkRole([5]), catchedAsync(usuarioController.createPersona));
//router.patch("/usuario/usuario/actualizar/:id", verifyToken, checkRole([5]), catchedAsync(usuarioController.updatePersonaOnlyAlias));
//router.get("/usuario/usuario/master", verifyToken, checkRole([5]), catchedAsync(usuarioController.getPersonaMaster));

router.get("/usuario/usuario/yo/:id", verifyToken, checkRole([5]), catchedAsync(usuarioController.yoUsuario));
export default router;
