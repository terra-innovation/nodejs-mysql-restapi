import * as usuarioController from "#root/src/controllers/empresario/factoring/usuario.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Empresario
router.get("/empresario/servicio/factoring/usuario/detalle", isAuth, isRole([3]), catchedAsync(usuarioController.getUsuario));
//router.get("/empresario/servicio/factoring/usuario/listar", isAuth, isRole([3]), catchedAsync(usuarioController.getEmpresacuentabancarias));
//router.post("/empresario/servicio/factoring/usuario/crear", isAuth, isRole([3]), catchedAsync(usuarioController.createEmpresacuentabancaria));
//router.patch("/empresario/servicio/factoring/usuario/actualizar/:id", isAuth, isRole([3]), catchedAsync(usuarioController.updateEmpresacuentabancariaOnlyAlias));
//router.get("/empresario/servicio/factoring/usuario/master", isAuth, isRole([3]), catchedAsync(usuarioController.getEmpresacuentabancariaMaster));

export default router;
