import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentasbancariaController from "../../controllers/admin/cuentabancariaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/cuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.getCuentasbancarias));
router.post("/admin/cuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.createCuentabancaria));
router.patch("/admin/cuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.updateCuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/cuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.getCuentasbancariasMaster));
router.delete("/admin/cuentabancaria/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.deleteCuentabancaria));
router.patch("/admin/cuentabancaria/activar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariaController.activateCuentabancaria));

export default router;
