import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioController from "#src/controllers/empresario/factoring/usuario.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/servicio/factoring/usuario/detalle", verifyToken, checkRole([3]), catchedAsync(usuarioController.getUsuario));
//router.get("/empresario/servicio/factoring/usuario/listar", verifyToken, checkRole([3]), catchedAsync(usuarioController.getEmpresacuentabancarias));
//router.post("/empresario/servicio/factoring/usuario/crear", verifyToken, checkRole([3]), catchedAsync(usuarioController.createEmpresacuentabancaria));
//router.patch("/empresario/servicio/factoring/usuario/actualizar/:id", verifyToken, checkRole([3]), catchedAsync(usuarioController.updateEmpresacuentabancariaOnlyAlias));
//router.get("/empresario/servicio/factoring/usuario/master", verifyToken, checkRole([3]), catchedAsync(usuarioController.getEmpresacuentabancariaMaster));

export default router;
