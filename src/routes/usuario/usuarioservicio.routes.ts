import * as usuarioservicioController from "#root/src/controllers/usuario/usuarioservicio.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.get("/usuario/usuarioservicio/listar", isAuth, isRole([5]), catchedAsync(usuarioservicioController.getUsuarioservicios));
//router.post("/usuario/usuarioservicio/crear", isAuth, isRole([5]), catchedAsync(usuarioservicioController.createUsuarioservicio));
//router.patch("/usuario/usuarioservicio/actualizar/:id", isAuth, isRole([5]), catchedAsync(usuarioservicioController.updateUsuarioservicioOnlyAlias));
router.get("/usuario/usuarioservicio/master/:id", isAuth, isRole([5]), catchedAsync(usuarioservicioController.getUsuarioservicioMaster));

router.post("/usuario/usuarioservicio/suscribir/factoring/empresa/:id", isAuth, isRole([5]), catchedAsync(usuarioservicioController.suscribirUsuarioServicioFactoringEmpresa));
router.post("/usuario/usuarioservicio/suscribir/factoring/inversionista/:id", isAuth, isRole([5]), catchedAsync(usuarioservicioController.suscribirUsuarioServicioFactoringInversionista));

export default router;
