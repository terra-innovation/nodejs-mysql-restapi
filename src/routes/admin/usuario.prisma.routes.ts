import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioController from "#src/controllers/admin/usuario.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

// Usuario
router.get("/admin/usuario/listar", isAuth, isRole([2]), catchedAsync(usuarioController.getUsuarios));
router.patch("/admin/usuario/activar/:id", isAuth, isRole([2]), catchedAsync(usuarioController.activateUsuario));
router.delete("/admin/usuario/eliminar/:id", isAuth, isRole([2]), catchedAsync(usuarioController.deleteUsuario));
router.get("/admin/usuario/master", isAuth, isRole([2]), catchedAsync(usuarioController.getUsuarioMaster));

export default router;
