import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentasbancariasController from "../../controllers/admin/cuentasbancariasController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/cuentasbancarias/listar", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancarias));
router.post("/admin/cuentasbancarias/crear", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.createCuentabancaria));
router.patch("/admin/cuentasbancarias/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.updateCuentabancariaOnlyAlias));
router.get("/admin/cuentasbancarias/master", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasMaster));
router.delete("/admin/cuentasbancarias/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.deleteCuentabancaria));
router.patch("/admin/cuentasbancarias/activar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.activateCuentabancaria));

export default router;
