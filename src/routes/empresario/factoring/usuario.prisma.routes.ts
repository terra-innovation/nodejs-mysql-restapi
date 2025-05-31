import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioController from "#src/controllers/empresario/factoring/usuario.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/factoring/usuario/detalle", verifyToken, checkRole([2]), catchedAsync(usuarioController.getUsuario));
//router.get("/empresario/factoring/usuario/listar", verifyToken, checkRole([2]), catchedAsync(usuarioController.getEmpresacuentabancarias));
//router.post("/empresario/factoring/usuario/crear", verifyToken, checkRole([2]), catchedAsync(usuarioController.createEmpresacuentabancaria));
//router.patch("/empresario/factoring/usuario/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(usuarioController.updateEmpresacuentabancariaOnlyAlias));
//router.get("/empresario/factoring/usuario/master", verifyToken, checkRole([2]), catchedAsync(usuarioController.getEmpresacuentabancariaMaster));

export default router;
