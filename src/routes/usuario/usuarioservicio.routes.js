import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as usuarioservicioController from "#src/controllers/usuario/usuarioservicioController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";
import * as usuarioservicioMiddleware from "#src/middlewares/usuarioservicioMiddleware.js";

const router = Router();

//Usuario
router.get("/usuario/usuarioservicio/listar", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.getUsuarioservicios));
//router.post("/usuario/usuarioservicio/crear", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.createUsuarioservicio));
//router.patch("/usuario/usuarioservicio/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.updateUsuarioservicioOnlyAlias));
router.get("/usuario/usuarioservicio/master/:id", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.getUsuarioservicioMaster));

router.post("/usuario/usuarioservicio/suscribir/factoring/empresa/:id", verifyToken, checkRole([2]), usuarioservicioMiddleware.upload, catchedAsync(usuarioservicioController.suscribirUsuarioServicioFactoringEmpresa));
router.post("/usuario/usuarioservicio/suscribir/factoring/inversionista/:id", verifyToken, checkRole([2]), catchedAsync(usuarioservicioController.suscribirUsuarioServicioFactoringInversionista));

export default router;
