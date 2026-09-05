import * as usuarioController from "#root/src/controllers/usuario/usuario.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
//router.get("/usuario/usuario/listar", isAuth, isRole([5]), catchedAsync(usuarioController.getPersonas));
//router.post("/usuario/usuario/crear", isAuth, isRole([5]), catchedAsync(usuarioController.createPersona));
//router.patch("/usuario/usuario/actualizar/:id", isAuth, isRole([5]), catchedAsync(usuarioController.updatePersonaOnlyAlias));
//router.get("/usuario/usuario/master", isAuth, isRole([5]), catchedAsync(usuarioController.getPersonaMaster));

router.get("/usuario/usuario/yo/:id", isAuth, isRole([5]), catchedAsync(usuarioController.yoUsuario));
export default router;
