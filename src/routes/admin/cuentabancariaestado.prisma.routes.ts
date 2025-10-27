import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as cuentabancariaestadoController from "#src/controllers/admin/cuentabancariaestado.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/cuentabancariaestado/listar", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.getCuentasbancarias));
router.post("/admin/cuentabancariaestado/crear", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.createCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/actualizar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.updateCuentabancariaestado));
router.delete("/admin/cuentabancariaestado/eliminar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.deleteCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/activar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.activateCuentabancariaestado));

export default router;
