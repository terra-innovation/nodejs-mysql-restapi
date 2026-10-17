import { Router } from "express";
import { isAuth, isRole } from "#src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as controller from "#src/controllers/admin/configuracionbbdd.Controller.js";
const router = Router(),
  base = "/admin/configuracionbbdd";
router.use(base, isAuth, isRole([2]));
router.get(`${base}/listar`, catchedAsync(controller.conexiones));
router.post(`${base}/probar`, catchedAsync(controller.probarBorrador));
router.post(base, catchedAsync(controller.crearConexion));
router.patch(`${base}/:id`, catchedAsync(controller.editarConexion));
router.patch(`${base}/:id/estado`, catchedAsync(controller.estadoConexion));
router.post(`${base}/:id/validar`, catchedAsync(controller.validarConexion));
export default router;
