import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioController from "#src/controllers/usuario/usuario.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
//router.get("/usuario/usuario/listar", isAuth, isRole([5]), catchedAsync(usuarioController.getPersonas));
//router.post("/usuario/usuario/crear", isAuth, isRole([5]), catchedAsync(usuarioController.createPersona));
//router.patch("/usuario/usuario/actualizar/:id", isAuth, isRole([5]), catchedAsync(usuarioController.updatePersonaOnlyAlias));
//router.get("/usuario/usuario/master", isAuth, isRole([5]), catchedAsync(usuarioController.getPersonaMaster));

router.get("/usuario/usuario/yo/:id", isAuth, isRole([5]), catchedAsync(usuarioController.yoUsuario));
export default router;
