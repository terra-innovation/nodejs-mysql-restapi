import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentabancariaController from "../../controllers/admin/cuentabancariaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/cuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.getCuentabancarias));
router.post("/admin/cuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.createCuentabancaria));
router.patch("/admin/cuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.updateCuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/cuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.getCuentabancariaMaster));
router.delete("/admin/cuentabancaria/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.deleteCuentabancaria));
router.patch("/admin/cuentabancaria/activar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.activateCuentabancaria));

export default router;
