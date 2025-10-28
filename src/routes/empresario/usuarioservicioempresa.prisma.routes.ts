import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioservicioempresaController from "#root/src/controllers/empresario/usuarioservicioempresa.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//empresario
router.get("/empresario/usuarioservicioempresa/listar", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.getUsuarioservicioempresas));
//router.post("/empresario/usuarioservicioempresa/crear", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.createUsuarioservicioempresa));
//router.patch("/empresario/usuarioservicioempresa/actualizar/:id", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.updateUsuarioservicioempresa));
router.get("/empresario/usuarioservicioempresa/master", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.getUsuarioservicioempresaMaster));
//router.delete("/empresario/usuarioservicioempresa/eliminar/:id", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.deleteUsuarioservicioempresa));
//router.patch("/empresario/usuarioservicioempresa/activar/:id", isAuth, isRole([3]), catchedAsync(usuarioservicioempresaController.activateUsuarioservicioempresa));

export default router;
