import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as servicioempresaController from "../../controllers/usuario/servicioempresaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";
import * as servicioempresaMiddleware from "../../middlewares/servicioempresaMiddleware.js";

const router = Router();

//Usuario
//router.get("/usuario/servicioempresa/listar", verifyToken, checkRole([2]), catchedAsync(servicioempresaController.getUsuarioservicios));
//router.post("/usuario/servicioempresa/crear", verifyToken, checkRole([2]), catchedAsync(servicioempresaController.createUsuarioservicio));
//router.patch("/usuario/servicioempresa/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(servicioempresaController.updateUsuarioservicioOnlyAlias));
//router.get("/usuario/servicioempresa/master/:id", verifyToken, checkRole([2]), catchedAsync(servicioempresaController.getUsuarioservicioMaster));

router.post("/usuario/servicioempresa/suscribir", verifyToken, checkRole([2]), servicioempresaMiddleware.upload, catchedAsync(servicioempresaController.suscribirEmpresaServicio));

export default router;
