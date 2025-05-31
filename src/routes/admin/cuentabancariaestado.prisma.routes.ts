import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as cuentabancariaestadoController from "#src/controllers/admin/cuentabancariaestado.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/cuentabancariaestado/listar", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadoController.getCuentasbancarias));
router.post("/admin/cuentabancariaestado/crear", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadoController.createCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadoController.updateCuentabancariaestado));
router.delete("/admin/cuentabancariaestado/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadoController.deleteCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/activar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadoController.activateCuentabancariaestado));

export default router;
