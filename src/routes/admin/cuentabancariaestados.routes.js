import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentabancariaestadosController from "../../controllers/admin/cuentabancariaestadosController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/cuentabancariaestados/listar", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadosController.getCuentasbancarias));
router.post("/admin/cuentabancariaestados/crear", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadosController.createCuentabancariaestado));
router.patch("/admin/cuentabancariaestados/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadosController.updateCuentabancariaestado));
router.delete("/admin/cuentabancariaestados/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadosController.deleteCuentabancariaestado));
router.patch("/admin/cuentabancariaestados/activar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaestadosController.activateCuentabancariaestado));

export default router;
