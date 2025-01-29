import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as usuarioservicioController from "../../controllers/usuario/usuarioservicioController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";
import * as usuarioservicioMiddleware from "../../middlewares/usuarioservicioMiddleware.js";

const router = Router();

//Usuario
router.get("/usuario/usuarioservicio/listar", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.getUsuarioservicios));
//router.post("/usuario/usuarioservicio/crear", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.createUsuarioservicio));
//router.patch("/usuario/usuarioservicio/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.updateUsuarioservicioOnlyAlias));
router.get("/usuario/usuarioservicio/master/:id", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.getUsuarioservicioMaster));

router.post("/usuario/usuarioservicio/suscribir/:id", verifyToken, checkRole([2]), usuarioservicioMiddleware.upload, catchedAsync(usuarioservicioController.suscribirUsuarioServicio));

export default router;
