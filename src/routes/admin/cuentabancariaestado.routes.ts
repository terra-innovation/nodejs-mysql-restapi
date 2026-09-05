import * as cuentabancariaestadoController from "#root/src/controllers/admin/cuentabancariaestado.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/cuentabancariaestado/listar", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.getCuentasbancarias));
router.post("/admin/cuentabancariaestado/crear", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.createCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/actualizar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.updateCuentabancariaestado));
router.delete("/admin/cuentabancariaestado/eliminar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.deleteCuentabancariaestado));
router.patch("/admin/cuentabancariaestado/activar/:id", isAuth, isRole([2]), catchedAsync(cuentabancariaestadoController.activateCuentabancariaestado));

export default router;
